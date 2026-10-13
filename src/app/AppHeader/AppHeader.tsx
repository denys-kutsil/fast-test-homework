import React from "react";
import { observer } from "mobx-react";

import { useController } from "shared/lib/useController";
import { AppHeaderController } from "./AppHeader.controller";

export const AppHeader = observer(() => {
  const controller = useController(AppHeaderController);

  return (
    <header className="app-header">
      <h1 className="app-header__title">Books</h1>
      <span className="app-header__counter">{controller.booksCountLabel}</span>
    </header>
  );
});
