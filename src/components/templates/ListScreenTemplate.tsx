import {
  FunctionalList,
  type FunctionalListProps,
} from "@/components/organisms/FunctionalList";
import { SearchControl } from "@/components/molecules/SearchControl";
import {
  ScreenTemplate,
  type ScreenTemplateProps,
} from "@/components/templates/ScreenTemplate";

export interface ListScreenTemplateProps<T> extends Pick<
  ScreenTemplateProps,
  "title" | "onBack" | "headerRight"
> {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  list: FunctionalListProps<T>;
}

/** ScreenTemplate variant for the "list with filters" shape shared by S01/S02/S04 (architecture.md §3/§7). */
export function ListScreenTemplate<T>({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  list,
  ...screenProps
}: ListScreenTemplateProps<T>) {
  return (
    <ScreenTemplate {...screenProps} contentClassName="px-md gap-sm">
      {onSearchChange ? (
        <SearchControl
          value={searchValue ?? ""}
          onChangeText={onSearchChange}
          placeholder={searchPlaceholder}
        />
      ) : null}
      <FunctionalList {...list} />
    </ScreenTemplate>
  );
}
