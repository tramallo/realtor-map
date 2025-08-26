import { ComponentProps } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Button, Stack } from "@mui/material";

import { LoginPane } from "./LoginPane";
import { CustomTextField } from "./CustomTextField";

// mock dependencies
vi.mock("@mui/material", () => ({
  TextField: vi.fn((props) => (
    <input data-testid={`textfield-${props.label}`} {...props} />
  )),
  Button: vi.fn((props: ComponentProps<typeof Button>) => (
    <button
      data-testid="login-button"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )),
  CircularProgress: vi.fn(() => <div data-testid="circular-progress" />),
  Stack: vi.fn((props) => <div data-testid="stack" {...props} />),
  Typography: vi.fn((props) => <p data-testid="typography" {...props} />),
}));

vi.mock("./CustomTextField", () => ({
  CustomTextField: vi.fn((props: ComponentProps<typeof CustomTextField>) => (
    <input 
      type="text" 
      data-testid={`customTextField-${props.label}`} 
      disabled={props.disabled} 
      value={props.value || ''}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  ))
}));

const authContextMock = {
  startSession: vi.fn(),
};
vi.mock("./AuthContext", () => ({
  useAuthContext: vi.fn(() => authContextMock),
}));

describe("LoginPane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields and login button", () => {
    render(<LoginPane />);

    expect(screen.getByTestId("customTextField-Email")).toBeInTheDocument();
    expect(screen.getByTestId("customTextField-Password")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("updates email and password state when input values change", () => {
    render(<LoginPane />);

    fireEvent.change(screen.getByTestId("customTextField-Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByTestId("customTextField-Password"), {
      target: { value: "password123" },
    });

    expect(screen.getByTestId("customTextField-Email")).toHaveValue(
      "test@example.com"
    );
    expect(screen.getByTestId("customTextField-Password")).toHaveValue("password123");
  });

  it("disables form elements during login attempt", async () => {
    authContextMock.startSession.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: undefined }), 300)
        )
    );

    render(<LoginPane />);

    fireEvent.click(screen.getByTestId("login-button"));
    expect(screen.getByTestId("customTextField-Email")).toBeDisabled();
    expect(screen.getByTestId("customTextField-Password")).toBeDisabled();
    expect(screen.getByTestId("login-button")).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByTestId("login-button")).not.toBeDisabled();
    });
  });

  it("shows loading spinner in button during login", async () => {
    authContextMock.startSession.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: undefined }), 300)
        )
    );

    render(<LoginPane />);

    fireEvent.click(screen.getByTestId("login-button"));
    expect(screen.getByTestId("circular-progress")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("circular-progress")).not.toBeInTheDocument();
    });
  });

  it("displays error message when login fails", async () => {
    const error = new Error("Invalid credentials");
    authContextMock.startSession.mockResolvedValueOnce({ error });

    render(<LoginPane />);

    fireEvent.click(screen.getByTestId("login-button"));
    await waitFor(() => {
      expect(screen.getByTestId("typography")).toHaveTextContent(error.message);
    });
  });

  it("calls startSession with email and password on button click", async () => {
    authContextMock.startSession.mockResolvedValueOnce({ error: undefined });

    render(<LoginPane />);

    fireEvent.change(screen.getByTestId("customTextField-Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByTestId("customTextField-Password"), {
      target: { value: "securepass" },
    });
    fireEvent.click(screen.getByTestId("login-button"));

    await waitFor(() => {
      expect(authContextMock.startSession).toHaveBeenCalledWith(
        "user@example.com",
        "securepass"
      );
    });
  });

  it("maintains proper component structure", () => {
    render(<LoginPane />);

    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({ spacing: 2 }),
      expect.anything()
    );
    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: "row",
        spacing: 2,
        justifyContent: "end",
      }),
      expect.anything()
    );
  });

  it("does not display error message on successful login", async () => {
    authContextMock.startSession.mockResolvedValueOnce({ error: undefined });

    render(<LoginPane />);

    fireEvent.click(screen.getByTestId("login-button"));
    await waitFor(() => {
      expect(screen.queryByTestId("typography")).not.toBeInTheDocument();
    });
  });
});
