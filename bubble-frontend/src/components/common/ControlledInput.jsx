// src/components/common/ControlledInput.jsx
import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import CustomInput from "./CustomInput";

const ControlledInput = forwardRef(
  ({ control, name, rules, defaultValue = "", ...inputProps }, ref) => {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <CustomInput
            ref={ref}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            touched={!!error}
            {...inputProps}
          />
        )}
      />
    );
  }
);

ControlledInput.displayName = "ControlledInput";

export default ControlledInput;
