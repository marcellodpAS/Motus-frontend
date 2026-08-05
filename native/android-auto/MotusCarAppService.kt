package __ANDROID_AUTO_PACKAGE__

import androidx.car.app.CarAppService
import androidx.car.app.Session
import androidx.car.app.SessionInfo
import androidx.car.app.validation.HostValidator

/**
 * Declared in AndroidManifest.xml by plugins/withAndroidAutoCarAppService.js
 * (category androidx.car.app.category.POI, per
 * https://developer.android.com/training/cars/apps/library/set-up-project
 * — automotive-feasibility.md §1.11). No React Native UI is renderable
 * here: every Screen in this package builds androidx.car.app.model.*
 * templates directly from the Task 14 view models
 * (src/automotive/types/template.ts), never Expo Router.
 */
class MotusCarAppService : CarAppService() {
    override fun onCreateSession(sessionInfo: SessionInfo): Session = MotusSession()

    /**
     * ALLOW_ALL_HOSTS_VALIDATOR is a development-only placeholder for
     * testing against the Desktop Head Unit / Automotive OS emulator
     * (automotive-feasibility.md §1.18,
     * https://developer.android.com/reference/kotlin/androidx/car/app/validation/HostValidator).
     * Replace with an explicit host allowlist before any Play Store
     * release — see "Verifiche manuali" in
     * docs/motus/android-auto-integration.md.
     */
    override fun createHostValidator(): HostValidator = HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
}
