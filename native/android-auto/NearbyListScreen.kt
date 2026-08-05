package __ANDROID_AUTO_PACKAGE__

import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.ItemList
import androidx.car.app.model.PlaceListMapTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template

/**
 * S04 (impianti vicini) — the only screen automotive-feasibility.md §1.3
 * rates an "ottimo fit" with no free-text input. Renders
 * AutomotivePlaceListViewModel (src/automotive/types/template.ts) onto a
 * PlaceListMapTemplate, which requires the app to declare the POI category
 * and the androidx.car.app.MAP_TEMPLATES permission — both added by
 * plugins/withAndroidAutoCarAppService.js — per
 * https://developer.android.com/training/cars/apps/poi#access-map-templates.
 */
class NearbyListScreen(
    carContext: CarContext,
    private val dataSource: MotusDataSource,
) : Screen(carContext) {

    override fun onGetTemplate(): Template {
        val viewModel =
            try {
                dataSource.fetchNearby()
            } catch (error: NotImplementedError) {
                return buildMessageTemplate(
                    MotusMessageViewModel(
                        headline = "Impianti non disponibili",
                        body = "MotusDataSource non è ancora collegato al backend (vedi MotusDataSource.kt).",
                    ),
                    Action.APP_ICON,
                )
            }

        // Mirrors toEmptyMessageViewModel() (src/automotive/models/message.ts).
        if (viewModel.items.isEmpty()) {
            return buildMessageTemplate(
                MotusMessageViewModel(
                    headline = "Nessun impianto trovato",
                    body = "Prova ad avvicinarti a un centro abitato.",
                ),
                Action.APP_ICON,
            )
        }

        val itemList = ItemList.Builder()
        for (item in viewModel.items) {
            val rowBuilder =
                Row.Builder()
                    .setTitle(item.title)
                    // PlaceListMapTemplate.Builder.setItemList requires every
                    // non-browsable row to carry a DistanceSpan; this
                    // scaffold marks every row browsable instead, since no
                    // DistanceSpan formatting is wired up yet — see
                    // https://developer.android.com/reference/kotlin/androidx/car/app/model/PlaceListMapTemplate.Builder#setItemList(androidx.car.app.model.ItemList)
                    .setBrowsable(true)
                    .setOnClickListener {
                        screenManager.push(PlaceDetailScreen(carContext, item.id, dataSource))
                    }
            // Up to 2 addText lines allowed by this template — item has at
            // most subtitle + priceLabel (src/automotive/models/placeItem.ts).
            item.subtitle?.let { rowBuilder.addText(it) }
            item.priceLabel?.let { rowBuilder.addText(it) }
            itemList.addItem(rowBuilder.build())
        }

        return PlaceListMapTemplate.Builder()
            .setTitle(viewModel.headline)
            .setHeaderAction(Action.APP_ICON)
            .setItemList(itemList.build())
            .setOnContentRefreshListener { invalidate() }
            .build()
    }
}
