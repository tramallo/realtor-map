import { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import ClientField from "./ClientField";
import ComponentsField from "./ComponentsField";
import ClientChip from "./ClientChip";
import CustomModal from "./CustomModal";
import { SelectClient } from "./clients/SelectClient";

// mock dependencies
vi.mock("./ComponentsField", () => ({
  default: vi.fn((props: ComponentProps<typeof ComponentsField>) => (
    <div>
      {props.onActionButtonClick && (
        <button
          data-testid="open-select-client-button"
          onClick={props.onActionButtonClick}
        />
      )}
      {...props.components}
    </div>
  )),
}));

vi.mock("./ClientChip", () => ({
  default: vi.fn((props: ComponentProps<typeof ClientChip>) => (
    <div data-testid={`client-chip-${props.clientId}`}>
      <button
        data-testid={`client-chip-close-${props.clientId}`}
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

vi.mock("./clients/SelectClient", () => ({
  SelectClient: vi.fn((props: ComponentProps<typeof SelectClient>) => (
    <div data-testid="select-client">
      <button
          data-testid="select-client-button"
          onClick={() => props.onSelect(props.defaultSelected ?? [])}
        />
    </div>
  )),
}));

describe("ClientField", () => {
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

      render(<ClientField {...testProps} />);

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

      render(<ClientField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ errorMessage: errorMessageTest }),
        expect.anything()
      );
    }
  );

  it.each([true, false, undefined])(
    "passes 'multiple' prop down to SelectClient",
    (multipleTest) => {
      const testProps = {
        multiple: multipleTest,
        selected: [],
        onSelect: vi.fn(),
      };

      render(<ClientField {...testProps} />);

      const openListButton = screen.getByTestId("open-select-client-button");
      fireEvent.click(openListButton);

      expect(SelectClient).toHaveBeenCalledWith(
        expect.objectContaining({ multiselect: multipleTest }),
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

        render(<ClientField {...testProps} />);

        expect(ComponentsField).toHaveBeenCalledWith(
          expect.objectContaining({ readOnly: readOnlyTest }),
          expect.anything()
        );
      }
    );

    it("doesn't add 'onActionButtonClick' to ComponentsField nor 'onClose' to ClientChip when readOnly is true", () => {
      const testProps = {
        selected: [1],
        onSelect: vi.fn(),
        readOnly: true,
      };

      render(<ClientField {...testProps} />);

      expect(ComponentsField).toHaveBeenCalledWith(
        expect.objectContaining({ onActionButtonClick: undefined }),
        expect.anything()
      );
      expect(ClientChip).toHaveBeenCalledWith(
        expect.objectContaining({ onClose: undefined }),
        expect.anything()
      );
    });
  });

  it("open-select-client-modal-button is hidden when 'readOnly' is true", () => {
    const testProps = {
      selected: [1],
      onSelect: vi.fn(),
      readOnly: true,
    };

    render(<ClientField {...testProps} />);

    expect(screen.queryByTestId("open-select-client-button")).toBeNull();
  });

  it("opens ClientSelect modal when clicking ComponentsField action button", () => {
    const testProps = {
      selected: [1],
      onSelect: vi.fn(),
    };

    render(<ClientField {...testProps} />);

    expect(screen.queryByTestId("select-client")).toBeNull();

    const openButton = screen.getByTestId("open-select-client-button");
    fireEvent.click(openButton);

    expect(screen.getByTestId("select-client")).toBeInTheDocument();
  });

  it("select-client receives default selected clients", () => {
    const selectedIds = [1, 2];
    const testProps = {
      selected: selectedIds,
      onSelect: vi.fn(),
    };

    render(<ClientField {...testProps} />);

    const openButton = screen.getByTestId("open-select-client-button");
    fireEvent.click(openButton);

    expect(SelectClient).toHaveBeenCalledWith(
      expect.objectContaining({ defaultSelected: selectedIds }),
      expect.anything()
    );
  });

  it("triggers onSelect callback when select-client triggers its onSelect", () => {
    const selectedIds = [1, 2, 4];
    const onSelectMock = vi.fn();
    const testProps = {
      selected: selectedIds,
      onSelect: onSelectMock,
    };

    render(<ClientField {...testProps} />);

    const openButton = screen.getByTestId("open-select-client-button");
    fireEvent.click(openButton);
    const selectButton = screen.getByTestId("select-client-button");
    fireEvent.click(selectButton);

    expect(onSelectMock).toHaveBeenCalledWith(selectedIds);
  });

  it("triggers onSelect without removed client when closing a chip", () => {
    const selectedIds = [1, 2, 4];
    const onSelectMock = vi.fn();
    const testProps = {
      selected: selectedIds,
      onSelect: onSelectMock,
    };

    render(<ClientField {...testProps} />);

    const closeButton = screen.getByTestId("client-chip-close-4");
    fireEvent.click(closeButton);

    expect(onSelectMock).toHaveBeenCalledWith([1, 2]);
  });

  it("passes client-chips for each selected client to components-field", () => {
    const selectedIds = [1, 2, 4];
    const testProps = {
      selected: selectedIds,
      onSelect: vi.fn(),
    };

    render(<ClientField {...testProps} />);

    expect(ComponentsField).toHaveBeenCalledWith(
      expect.objectContaining({
        components: expect.arrayContaining([
          expect.objectContaining({ type: ClientChip }),
          expect.objectContaining({ type: ClientChip }),
          expect.objectContaining({ type: ClientChip }),
        ]),
      }),
      expect.anything()
    );
  });
});
