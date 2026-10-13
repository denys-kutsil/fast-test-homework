import React from "react";
import { observer } from "mobx-react";

import { TextField } from "components/TextField/TextField";
import { useController } from "shared/lib/useController";
import { AddBookFormController } from "./AddBookForm.controller";

export const AddBookForm = observer(() => {
  const controller = useController(AddBookFormController);

  return (
    <div className="add-book-form">
      <TextField
        label="Title"
        value={controller.name}
        disabled={controller.areFieldsDisabled}
        onChange={controller.setName}
      />
      <TextField
        label="Author"
        value={controller.author}
        disabled={controller.areFieldsDisabled}
        onChange={controller.setAuthor}
      />
      <button type="button" disabled={controller.isSubmitDisabled} onClick={controller.submit}>
        Add
      </button>
      <p hidden={controller.isErrorHidden} className="error">
        {controller.error}
      </p>
    </div>
  );
});
