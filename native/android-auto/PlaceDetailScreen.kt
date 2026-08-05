package __ANDROID_AUTO_PACKAGE__

import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.Pane
import androidx.car.app.model.PaneTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template

/**
 * S03 (dettaglio impianto), reached from NearbyListScreen. Renders
 * AutomotivePlaceDetailViewModel (src/automotive/types/template.ts) as a
 * flat PaneTemplate row list — same "address row, then one row per price,
 * server order" shape as toPlaceDetailViewModel
 * (src/automotive/models/placeDetail.ts).
 */
class PlaceDetailScreen(
    carContext: CarContext,
    private val idImpianto: Int,
    private val dataSource: MotusDataSource,
) : Screen(carContext) {

    override fun onGetTemplate(): Template {
        val viewModel =
            try {
                dataSource.fetchPlaceDetail(idImpianto)
            } catch (error: NotImplementedError) {
                return buildMessageTemplate(
                    MotusMessageViewModel(
                        headline = "Dettaglio non disponibile",
                        body = "MotusDataSource non è ancora collegato al backend (vedi MotusDataSource.kt).",
                    ),
                    Action.BACK,
                )
            }

        val pane = Pane.Builder()
        for (row in viewModel.rows) {
            pane.addRow(Row.Builder().setTitle(row.label).addText(row.value).build())
        }

        return PaneTemplate.Builder(pane.build())
            .setTitle(viewModel.title)
            .setHeaderAction(Action.BACK)
            .build()
    }
}
