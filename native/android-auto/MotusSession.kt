package __ANDROID_AUTO_PACKAGE__

import android.content.Intent
import androidx.car.app.Screen
import androidx.car.app.Session

/**
 * https://developer.android.com/training/cars/apps/library/carappservice-session
 * — one Session per host connection. Always starts on the nearby list
 * (S04), the only screen automotive-feasibility.md §1.3 rates an "ottimo
 * fit" with no text entry (S01/S02 are explicitly out of scope for this
 * module, per docs/motus/automotive-shared-model.md §1).
 */
class MotusSession : Session() {
    private val dataSource: MotusDataSource = UnimplementedMotusDataSource()

    override fun onCreateScreen(intent: Intent): Screen = NearbyListScreen(carContext, dataSource)
}
