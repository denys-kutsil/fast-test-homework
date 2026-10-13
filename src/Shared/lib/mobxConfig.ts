import { configure } from "mobx";

// Mutating an observable outside an action now throws instead of silently
// causing an extra render pass. Imported by both the app and the test setup.
configure({ enforceActions: "always" });
