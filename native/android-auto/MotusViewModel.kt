package __ANDROID_AUTO_PACKAGE__

import org.json.JSONArray
import org.json.JSONObject

/**
 * Kotlin mirror of the shared automotive view models defined in
 * src/automotive/types/template.ts (Task 14): AutomotivePlaceItem,
 * AutomotivePlaceListViewModel, AutomotiveDetailRow,
 * AutomotivePlaceDetailViewModel, AutomotiveMessageViewModel. Field names
 * and nullability here must stay in lockstep with that file —
 * __tests__/automotive/nativeContract.test.ts locks the JSON keys produced
 * by the real Task 14 mapping functions (toPlaceListViewModel,
 * toPlaceDetailViewModel) against the keys this parser reads.
 *
 * Parsed with org.json (bundled in the Android platform SDK, not a project
 * dependency) rather than a serialization library: no bridge that would
 * actually hand this parser a JSON string exists yet — see
 * MotusDataSource.kt. This file's only job is to prove the Task 14 shape
 * maps cleanly onto Car App Library templates.
 */

data class MotusPlaceItem(
    val id: Int,
    val title: String,
    val subtitle: String?,
    val priceLabel: String?,
)

data class MotusPlaceListViewModel(
    val headline: String,
    val items: List<MotusPlaceItem>,
)

data class MotusDetailRow(
    val label: String,
    val value: String,
)

data class MotusPlaceDetailViewModel(
    val title: String,
    val rows: List<MotusDetailRow>,
)

data class MotusMessageViewModel(
    val headline: String,
    val body: String,
)

object MotusViewModelJson {
    private fun JSONObject.optionalString(key: String): String? =
        if (has(key) && !isNull(key)) getString(key) else null

    fun parsePlaceList(json: JSONObject): MotusPlaceListViewModel {
        val jsonItems: JSONArray = json.getJSONArray("items")
        val items = (0 until jsonItems.length()).map { index ->
            val item = jsonItems.getJSONObject(index)
            MotusPlaceItem(
                id = item.getInt("id"),
                title = item.getString("title"),
                subtitle = item.optionalString("subtitle"),
                priceLabel = item.optionalString("priceLabel"),
            )
        }
        return MotusPlaceListViewModel(headline = json.getString("headline"), items = items)
    }

    fun parsePlaceDetail(json: JSONObject): MotusPlaceDetailViewModel {
        val jsonRows: JSONArray = json.getJSONArray("rows")
        val rows = (0 until jsonRows.length()).map { index ->
            val row = jsonRows.getJSONObject(index)
            MotusDetailRow(label = row.getString("label"), value = row.getString("value"))
        }
        return MotusPlaceDetailViewModel(title = json.getString("title"), rows = rows)
    }

    fun parseMessage(json: JSONObject): MotusMessageViewModel =
        MotusMessageViewModel(
            headline = json.getString("headline"),
            body = json.getString("body"),
        )
}
