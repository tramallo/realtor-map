import { useCallback, useEffect, useRef } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Realtor } from "../../utils/data-schema";
import { CardRealtor } from "./CardRealtor";
import ComponentsField from "../ComponentsField";
import RealtorChip from "../RealtorChip";

export type ListRealtorsProps = Omit<StackProps, "onSelect"> & {
  realtorIds: Array<Realtor["id"]> | undefined;
  onReachScrollEnd?: () => void;
  selected?: Array<Realtor["id"]>;
  onSelect?: (selected: Array<Realtor["id"]>) => void;
  multiselect?: boolean;
};
const defaults = {
  selected: [],
};

export function ListRealtors({
  realtorIds,
  onReachScrollEnd,
  selected = defaults.selected,
  onSelect,
  multiselect,
  ...stackProps
}: ListRealtorsProps) {
  const bottomRef = useRef(null as HTMLLIElement | null);

  const { t } = useTranslation();

  console.log(`ListRealtors -> render - 
    realtorIds: ${realtorIds}`);

  const toggleRealtorSelection = useCallback(
    (realtorId: Realtor["id"]) => {
      const alreadySelected = selected.some(
        (selectedId) => selectedId === realtorId
      );

      if (alreadySelected) {
        return onSelect
          ? onSelect(selected.filter((sId) => sId !== realtorId))
          : undefined;
      }

      if (multiselect) {
        return onSelect ? onSelect([...selected, realtorId]) : undefined;
      }

      return onSelect ? onSelect([realtorId]) : undefined;
    },
    [selected, multiselect, onSelect]
  );

  // onReachScrollEnd effect
  useEffect(() => {
    const bottomItem = bottomRef.current;
    if (!bottomItem || !onReachScrollEnd) {
      return;
    }
    console.log(
      `ListRealtors -> onReachScrollEnd [effect] - register callback`
    );

    const onScrollEnd = () => {
      console.log(
        `ListRealtors -> onReachScrollEnd [effect] - execute callback`
      );
      onReachScrollEnd();
    };

    const observer = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? onScrollEnd() : undefined),
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(bottomItem);
    return () => {
      console.log(
        `ListRealtors -> onReachScrollEnd [effect] - unregister callback`
      );
      observer.unobserve(bottomItem);
    };
  }, [onReachScrollEnd]);

  return (
    <Stack
      spacing={1}
      justifyContent="space-between"
      overflow="hidden"
      {...stackProps}
    >
      <Box overflow="auto">
        <List disablePadding>
          {(realtorIds ?? []).map((realtorId, realtorIndex) => (
            <ListItem
              key={realtorIndex}
              sx={{ marginBottom: 1 }}
              disablePadding
            >
              <CardRealtor
                realtorId={realtorId}
                onClick={onSelect ? toggleRealtorSelection : undefined}
                selected={onSelect ? selected.includes(realtorId) : undefined}
              />
            </ListItem>
          ))}
          <ListItem ref={bottomRef}></ListItem>
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label={t("fields.selectedField.label")}
          components={selected.map((selectedId, selectedIndex) => (
            <RealtorChip
              key={selectedIndex}
              realtorId={selectedId}
              onClose={() => toggleRealtorSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
