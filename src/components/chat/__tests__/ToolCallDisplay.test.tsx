import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolLabel } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create pending", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "src/components/Button.jsx" }, false)
  ).toBe("Creating Button.jsx");
});

test("getToolLabel: str_replace_editor create complete", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "src/components/Button.jsx" }, true)
  ).toBe("Created Button.jsx");
});

test("getToolLabel: str_replace_editor str_replace pending", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "str_replace", path: "src/App.tsx" }, false)
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor str_replace complete", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "str_replace", path: "src/App.tsx" }, true)
  ).toBe("Edited App.tsx");
});

test("getToolLabel: str_replace_editor insert pending", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" }, false)
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert complete", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" }, true)
  ).toBe("Edited App.tsx");
});

test("getToolLabel: str_replace_editor view pending", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "src/index.js" }, false)
  ).toBe("Reading index.js");
});

test("getToolLabel: str_replace_editor view complete", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "src/index.js" }, true)
  ).toBe("Read index.js");
});

test("getToolLabel: str_replace_editor undo_edit pending", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" }, false)
  ).toBe("Reverting App.tsx");
});

test("getToolLabel: str_replace_editor undo_edit complete", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" }, true)
  ).toBe("Reverted App.tsx");
});

test("getToolLabel: file_manager rename pending", () => {
  expect(
    getToolLabel("file_manager", { command: "rename", path: "src/Card.jsx", new_path: "src/CardComponent.jsx" }, false)
  ).toBe("Renaming Card.jsx");
});

test("getToolLabel: file_manager rename complete", () => {
  expect(
    getToolLabel("file_manager", { command: "rename", path: "src/Card.jsx", new_path: "src/CardComponent.jsx" }, true)
  ).toBe("Renamed Card.jsx \u2192 CardComponent.jsx");
});

test("getToolLabel: file_manager delete pending", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "src/OldComponent.jsx" }, false)
  ).toBe("Deleting OldComponent.jsx");
});

test("getToolLabel: file_manager delete complete", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "src/OldComponent.jsx" }, true)
  ).toBe("Deleted OldComponent.jsx");
});

test("getToolLabel: empty args fallback pending", () => {
  expect(getToolLabel("str_replace_editor", {}, false)).toBe("Working on files\u2026");
});

test("getToolLabel: empty args fallback complete", () => {
  expect(getToolLabel("str_replace_editor", {}, true)).toBe("File operation complete");
});

test("getToolLabel: unknown tool shows raw tool name", () => {
  expect(getToolLabel("some_other_tool", { command: "do_thing" }, false)).toBe("some_other_tool");
});

test("getToolLabel: extracts only filename from deep path", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "create", path: "src/components/ui/deep/Button.jsx" }, true)
  ).toBe("Created Button.jsx");
});

// --- ToolCallDisplay component tests ---

test("ToolCallDisplay shows pending label", () => {
  render(
    <ToolCallDisplay
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Button.jsx")).toBeDefined();
});

test("ToolCallDisplay shows complete label", () => {
  render(
    <ToolCallDisplay
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.jsx" }}
      state="result"
      result="OK"
    />
  );
  expect(screen.getByText("Created Button.jsx")).toBeDefined();
});

test("ToolCallDisplay shows spinner when pending", () => {
  const { container } = render(
    <ToolCallDisplay
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.jsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallDisplay shows green dot when complete", () => {
  const { container } = render(
    <ToolCallDisplay
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.jsx" }}
      state="result"
      result="OK"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallDisplay shows spinner when state is result but result is undefined", () => {
  const { container } = render(
    <ToolCallDisplay
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.jsx" }}
      state="result"
    />
  );
  // result is undefined so isComplete is false — shows spinner
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallDisplay file_manager rename complete", () => {
  render(
    <ToolCallDisplay
      toolName="file_manager"
      args={{ command: "rename", path: "src/Card.jsx", new_path: "src/CardComponent.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );
  expect(screen.getByText("Renamed Card.jsx \u2192 CardComponent.jsx")).toBeDefined();
});

test("ToolCallDisplay accepts className prop", () => {
  const { container } = render(
    <ToolCallDisplay
      toolName="str_replace_editor"
      args={{}}
      state="call"
      className="my-custom-class"
    />
  );
  expect(container.firstChild?.className).toContain("my-custom-class");
});
