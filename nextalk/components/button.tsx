import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`border-2 border-orange-300 px-7 py-2 rounded-full font-bold cursor-pointer transition-all duration-300 ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
