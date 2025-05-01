import { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import PersonField from "./PersonField";
import ComponentsField from "./ComponentsField";
import PersonChip from "./PersonChip";
import CustomModal from "./CustomModal";
import ListPersons from "./persons/ListPersons";

// mock dependencies
vi.mock("./ComponentsField", () => ({
  default: vi.fn((props: ComponentProps<typeof ComponentsField>) => (
    <div>
      {props.onActionButtonClick && (
        <button
          data-testid="open-list-persons-modal-button"
          onClick={props.onActionButtonClick}
        />
      )}
      {props.components}
    </div>
  )),
}));

vi.mock("./PersonChip", () => ({
  default: vi.fn((props: ComponentProps<typeof PersonChip>) => (
    <div data-testid={`person-chip-${props.personId}`}>
      <button
        data-testid={`person-chip-close-${props.personId}`}
        onClick={props.onClose}
      />
    </div>
  )),
}));

vi.mock("./CustomModal", () => ({
  default: vi.fn((props: ComponentProps<typeof CustomModal>) => (
    <div data-testid="custom-modal">{props.open ? props.children : null}</div>
  )),
}));

vi.mock("./persons/ListPersons", () => ({
  default: vi.fn((props: ComponentProps<typeof ListPersons>) => (
    <div data-testid="list-persons">
      {props.onSelect && (
        <button
          data-testid="list-persons-select-button"
          onClick={() => props.onSelect!(props.defaultSelected ?? [])}
        />
      )}
    </div>
  )),
}));

describe("PersonField", () => {
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

      render(<PersonField {...testProps} />);

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

      render(<PersonField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ errorMessage: errorMessageTest }),
        expect.anything()
      );
    }
  );

  it.each([true, false, undefined])(
    "passes 'multiple' prop down to ListPersons multiple",
    (multipleTest) => {
      const testProps = {
        multiple: multipleTest,
        selected: [],
        onSelect: vi.fn(),
      };

      render(<PersonField {...testProps} />);

      const openListButton = screen.getByTestId(
        "open-list-persons-modal-button"
      );
      fireEvent.click(openListButton);

      expect(ListPersons).toHaveBeenCalledWith(
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

        render(<PersonField {...testProps} />);

        expect(ComponentsField).toHaveBeenCalledWith(
          expect.objectContaining({ readOnly: readOnlyTest }),
          expect.anything()
        );
      }
    );

    it("doesn't add 'onActionButtonClick' to ComponentsField nor 'onClose' to PersonChip when readOnly is true", () => {
      const testProps = {
        selected: [1],
        onSelect: vi.fn(),
        readOnly: true,
      };

      render(<PersonField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ onActionButtonClick: undefined }),
        expect.anything()
      );
      expect(PersonChip).toHaveBeenCalledWith(
        expect.objectContaining({ onClose: undefined }),
        expect.anything()
      );
    });
  });

  it("open-list-persons-modal-button is hidden when 'readOnly' is true", () => {
    const testProps = {
      selected: [1],
      onSelect: vi.fn(),
      readOnly: true,
    };

    render(<PersonField {...testProps} />);

    expect(screen.queryByTestId("open-list-persons-modal-button")).toBeNull();
  });

  it("opens person list when clicking ComponentsField action button", () => {
    const testProps = {
      selected: [1],
      onSelect: vi.fn(),
    };

    render(<PersonField {...testProps} />);

    expect(screen.queryByTestId("list-persons")).toBeNull();

    const openButton = screen.getByTestId("open-list-persons-modal-button");
    fireEvent.click(openButton);

    expect(screen.getByTestId("list-persons")).toBeInTheDocument();
  });

  it("persons-list receives selected persons as defaultSelected when opened", () => {
    const selectedIds = [1, 2];
    const testProps = {
      selected: selectedIds,
      onSelect: vi.fn(),
    };

    render(<PersonField {...testProps} />);

    const openButton = screen.getByTestId("open-list-persons-modal-button");
    fireEvent.click(openButton);

    expect(ListPersons).toHaveBeenCalledWith(
      expect.objectContaining({ defaultSelected: selectedIds }),
      expect.anything()
    );
  });

  it("triggers onSelect callback when list-persons triggers its onSelect", () => {
    const selectedIds = [1, 2, 4];
    const onSelectMock = vi.fn();
    const testProps = {
      selected: selectedIds,
      onSelect: onSelectMock,
    };

    render(<PersonField {...testProps} />);

    const openButton = screen.getByTestId("open-list-persons-modal-button");
    fireEvent.click(openButton);
    const selectButton = screen.getByTestId("list-persons-select-button");
    fireEvent.click(selectButton);

    expect(onSelectMock).toHaveBeenCalledWith(selectedIds);
  });

  it("triggers onSelect without removed person when closing a chip", () => {
    const selectedIds = [1, 2, 4];
    const onSelectMock = vi.fn();
    const testProps = {
      selected: selectedIds,
      onSelect: onSelectMock,
    };

    render(<PersonField {...testProps} />);

    const closeButton = screen.getByTestId("person-chip-close-4");
    fireEvent.click(closeButton);

    expect(onSelectMock).toHaveBeenCalledWith([1, 2]);
  });

  it("passes person-chips for each selected person to components-field", () => {
    const selectedIds = [1, 2, 4];
    const testProps = {
      selected: selectedIds,
      onSelect: vi.fn(),
    };

    render(<PersonField {...testProps} />);

    expect(ComponentsField).toHaveBeenCalledWith(
      expect.objectContaining({
        components: expect.arrayContaining([
          expect.objectContaining({ type: PersonChip }),
          expect.objectContaining({ type: PersonChip }),
          expect.objectContaining({ type: PersonChip }),
        ]),
      }),
      expect.anything()
    );
  });
});
