"use client";

import React from "react";
import { InputType } from "@common/constants";
import { twMerge } from "tailwind-merge";
import { InputProps } from "./input-props.interface";

export function Input({ isHidden = true, ref, ...props }: InputProps) {
  const { className, type } = props;

  const inputClassName = twMerge("input", className);
  const isPasswordInput = type === InputType.Password;
  const inputType = isPasswordInput && !isHidden ? InputType.Text : type;

  return (
    <input {...props} type={inputType} className={inputClassName} ref={ref} />
  );
}
