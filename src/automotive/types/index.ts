export type {
  AutomotiveDetailRow,
  AutomotiveMessageViewModel,
  AutomotivePlaceDetailViewModel,
  AutomotivePlaceItem,
  AutomotivePlaceListViewModel,
  AutomotiveTemplateKind,
  AutomotiveViewModel,
} from "./template";

export type {
  AutomotiveDetailState,
  AutomotiveListState,
  AutomotiveListStatus,
  AutomotiveRequestStatus,
  LocationPermissionStatus,
} from "./state";

export type { RequiredCapabilityKey } from "./capability";
export {
  PLACE_DETAIL_REQUIRED_CAPABILITIES,
  PLACE_LIST_REQUIRED_CAPABILITIES,
  VOICE_SEARCH_REQUIRED_CAPABILITIES,
  hasRequiredCapabilities,
} from "./capability";
