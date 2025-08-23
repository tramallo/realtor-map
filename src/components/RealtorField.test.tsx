import { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import RealtorField from "./RealtorField";
import ComponentsField from "./ComponentsField";
import RealtorChip from "./RealtorChip";
import CustomModal from "./CustomModal";
import SearchRealtors from "./realtors/SearchRealtors";

// mock dependencies
vi.mock("./ComponentsField", () => ({
  default: vi.fn((props: ComponentProps<typeof ComponentsField>) => (
    <div>
      {props.onActionButtonClick && (
        <button
          data-testid="open-list-realtors-modal-button"
          onClick={props.onActionButtonClick}
        />
      )}
      {...props.components}
    </div>
  )),
}));

vi.mock("./RealtorChip", () => ({
  default: vi.fn((props: ComponentProps<typeof RealtorChip>) => (
    <div data-testid={`realtor-chip-${props.realtorId}`}>
      <button
        data-testid={`realtor-chip-close-${props.realtorId}`}
        onClick={props.onClose}
      />
    </div>
  )),
}));

vi.mock("./CustomModal", () => ({
  default: vi.fn((props: ComponentProps<typeof CustomModal>) => (
    <div data-testid={`custom-modal`}>{props.open ? props.children : null}</div>
  )),
}));

vi.mock("./realtors/ListRealtors", () => ({
  default: vi.fn((props: ComponentProps<typeof SearchRealtors>) => (
    <div data-testid="list-realtors">
      {props.onSelect && (
        <button
          data-testid="list-realtors-select-button"
          onClick={() => props.onSelect!(props.defaultSelected ?? [])}
        />
      )}
    </div>
  )),
}));

describe("RealtorField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["defined-label", undefined])(
    "passes label prop down to ComponentsField label",
    (labelTest) => {
      const testProps = {
        label: labelTest,
        selected: [],
        onSelect: vi.fn(),
      };

      render(<RealtorField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ label: labelTest }),
        expect.anything()
      );
    }
  );

  it.each(["defined-error", undefined])(
    "passes errorMessage down to ComponentsField errorMessage",
    (errorMessageTest) => {
      const testProps = {
        errorMessage: errorMessageTest,
        selected: [],
        onSelect: vi.fn(),
      };

      render(<RealtorField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ errorMessage: errorMessageTest }),
        expect.anything()
      );
    }
  );

  it.each([true, false, undefined])(
    "passes 'multiple' prop down to ListRealtors multiple",
    (multipleTest) => {
      const testProps = {
        multiple: multipleTest,
        selected: [],
        onSelect: vi.fn(),
      };

      render(<RealtorField {...testProps} />);

      const openRealtorListButton = screen.getByTestId(
        "open-list-realtors-modal-button"
      );
      fireEvent.click(openRealtorListButton);

      expect(SearchRealtors).toHaveBeenCalledWith(
        expect.objectContaining({ multiple: multipleTest }),
        expect.anything()
      );
    }
  );

  describe("readOnly prop", () => {
    it.each([true, false, undefined])(
      "passes down readOnly prop to ComponentsField",
      (readOnlyTest) => {
        const testProps = {
          selected: [],
          onSelect: vi.fn(),
          readOnly: readOnlyTest,
        };

        render(<RealtorField {...testProps} />);

        expect(ComponentsField).toHaveBeenCalledWith(
          expect.objectContaining({ readOnly: readOnlyTest }),
          expect.anything()
        );
      }
    );

    it("doesnt add 'onActionButtonClick' to ComponentsField nor 'onClose' to RealtorChip when readOnly is true", () => {
      const testProps = {
        selected: [1],
        onSelect: vi.fn(),
        readOnly: true,
      };

      render(<RealtorField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ onActionButtonClick: undefined }),
        expect.anything()
      );
      expect(RealtorChip).toHaveBeenCalledWith(
        expect.objectContaining({ onClose: undefined }),
        expect.anything()
      );
    });
  });

  it("open-list-realtors-modal-button is hidden when 'readOnly' is true", async () => {
    const testProps = {
      selected: [1],
      onSelect: vi.fn(),
      readOnly: true,
    };

    render(<RealtorField {...testProps} />);

    expect(screen.queryByTestId("open-list-realtors-modal-button")).toBeNull();
  });

  it("open realtor list when click ComponentsField action button", () => {
    const testProps = {
      selected: [1],
      onSelect: vi.fn(),
    };

    render(<RealtorField {...testProps} />);

    expect(screen.queryByTestId("list-realtors")).toBeNull();

    const openRealtorListButton = screen.getByTestId(
      "open-list-realtors-modal-button"
    );
    fireEvent.click(openRealtorListButton);

    expect(screen.queryByTestId("list-realtors")).toBeInTheDocument();
  });

  it("realtors-list receives selected realtors as defaultSelected when opened", () => {
    const selectedRealtorIds = [1, 2];
    const testProps = {
      selected: selectedRealtorIds,
      onSelect: vi.fn(),
    };

    render(<RealtorField {...testProps} />);

    const openRealtorListButton = screen.getByTestId(
      "open-list-realtors-modal-button"
    );
    fireEvent.click(openRealtorListButton);

    expect(SearchRealtors).toHaveBeenCalledWith(
      expect.objectContaining({ defaultSelected: selectedRealtorIds }),
      expect.anything()
    );
  });

  it("triggers onSelect callback when list-realtors triggers its onSelect callback", () => {
    const selectedRealtorIds = [1, 2, 4];
    const onSelectCallback = vi.fn();
    const testProps = {
      selected: selectedRealtorIds,
      onSelect: onSelectCallback,
    };

    render(<RealtorField {...testProps} />);

    const openRealtorListButton = screen.getByTestId(
      "open-list-realtors-modal-button"
    );
    fireEvent.click(openRealtorListButton);
    const listRealtorsSelectButton = screen.getByTestId(
      "list-realtors-select-button"
    );
    fireEvent.click(listRealtorsSelectButton);

    expect(onSelectCallback).toBeCalledWith(selectedRealtorIds);
  });

  it("triggers onSelect callback without the removed realtor when a realtor-chip closes", () => {
    const selectedRealtorIds = [1, 2, 4];
    const onSelectCallback = vi.fn();
    const testProps = {
      selected: selectedRealtorIds,
      onSelect: onSelectCallback,
    };

    render(<RealtorField {...testProps} />);

    const realtorChip4 = screen.queryByTestId(`realtor-chip-4`);
    expect(realtorChip4).toBeInTheDocument();

    const closeRealtorChip4 = screen.getByTestId(`realtor-chip-close-4`);
    fireEvent.click(closeRealtorChip4);

    expect(onSelectCallback).toHaveBeenCalledWith([1, 2]);
  });

  it("passes a realtor-chip for each selected realtor as array to components-field 'component'", () => {
    const selectedRealtorIds = [1, 2, 4];
    const testProps = {
      selected: selectedRealtorIds,
      onSelect: vi.fn(),
    };

    render(<RealtorField {...testProps} />);

    expect(ComponentsField).toHaveBeenCalledWith(
      expect.objectContaining({
        components: expect.arrayContaining([
          expect.objectContaining({ type: RealtorChip }),
          expect.objectContaining({ type: RealtorChip }),
          expect.objectContaining({ type: RealtorChip }),
        ]),
      }),
      expect.anything()
    );
    expect(RealtorChip).toHaveBeenCalledWith(
      expect.objectContaining({ realtorId: 1 }),
      expect.anything()
    );
    expect(RealtorChip).toHaveBeenCalledWith(
      expect.objectContaining({ realtorId: 2 }),
      expect.anything()
    );
    expect(RealtorChip).toHaveBeenCalledWith(
      expect.objectContaining({ realtorId: 4 }),
      expect.anything()
    );
  });
});
