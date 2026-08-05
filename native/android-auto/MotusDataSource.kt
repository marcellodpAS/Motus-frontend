package __ANDROID_AUTO_PACKAGE__

/**
 * The seam between this Car App Library scaffold and Motus's real data.
 * Deliberately unimplemented: a CarAppService runs in its own Android
 * component, not inside this project's React Native/Hermes runtime, so it
 * cannot call src/services/motus/stations.ts directly at runtime. A real
 * implementation would issue its own HTTP calls to the same backend
 * (docs/motus/api-contract.md) using Kotlin networking code — deliberately
 * not written here, since untested network code with no way to run it in
 * this environment (no Java/Android SDK available when this scaffold was
 * built, see docs/motus/android-auto-integration.md "Verifiche manuali")
 * would be exactly the kind of unproven integration Task 15's constraints
 * rule out. Wiring this interface to the real backend is listed as an open
 * prerequisite in that document.
 */
interface MotusDataSource {
    fun fetchNearby(): MotusPlaceListViewModel
    fun fetchPlaceDetail(idImpianto: Int): MotusPlaceDetailViewModel
}

class UnimplementedMotusDataSource : MotusDataSource {
    override fun fetchNearby(): MotusPlaceListViewModel {
        throw NotImplementedError(
            "MotusDataSource.fetchNearby() has no implementation yet — wire it to the Motus REST API " +
                "(docs/motus/api-contract.md) before shipping this service. Also note VS5 (nearby, S04) " +
                "is not implemented server-side of this repo's own mobile app yet either " +
                "(docs/motus/automotive-shared-model.md §2).",
        )
    }

    override fun fetchPlaceDetail(idImpianto: Int): MotusPlaceDetailViewModel {
        throw NotImplementedError(
            "MotusDataSource.fetchPlaceDetail() has no implementation yet — wire it to the Motus REST API " +
                "(docs/motus/api-contract.md) before shipping this service.",
        )
    }
}
