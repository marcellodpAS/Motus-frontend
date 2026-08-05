package __ANDROID_AUTO_PACKAGE__

import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.Template

/**
 * Mirrors AutomotiveMessageViewModel (src/automotive/types/template.ts) —
 * the terminal, single-message screen Task 14 defines for every non-list/
 * non-detail state (empty results, errors, denied/unavailable location —
 * see toErrorMessageViewModel/toEmptyMessageViewModel/
 * toLocationDeniedMessageViewModel in src/automotive/models/message.ts).
 * Used both as a standalone pushable Screen (e.g. a future location-denied
 * entry point) and, via [buildMessageTemplate], as the fallback template
 * NearbyListScreen/PlaceDetailScreen return inline.
 */
class MessageScreen(
    carContext: CarContext,
    private val viewModel: MotusMessageViewModel,
    private val headerAction: Action = Action.BACK,
) : Screen(carContext) {
    override fun onGetTemplate(): Template = buildMessageTemplate(viewModel, headerAction)
}

/**
 * MessageTemplate.Builder.setHeaderAction only accepts Action.APP_ICON or
 * Action.BACK (https://developer.android.com/reference/kotlin/androidx/car/app/model/MessageTemplate.Builder#setHeaderAction(androidx.car.app.model.Action)):
 * APP_ICON for an entry screen with no previous screen to return to,
 * BACK for a screen pushed on top of another one.
 */
fun buildMessageTemplate(viewModel: MotusMessageViewModel, headerAction: Action): Template =
    MessageTemplate.Builder(viewModel.body)
        .setTitle(viewModel.headline)
        .setHeaderAction(headerAction)
        .build()
