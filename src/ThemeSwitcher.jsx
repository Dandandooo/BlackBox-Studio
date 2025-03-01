import "./styles.css";
import React, { useState } from "react";
import { ControlButton } from "@xyflow/react";

import { Light, Dark } from "./theme";
import styled from "styled-components";

const ThemeIcon = styled.img`
object-fit: contain;
width: 100%;
`;


export default function ThemeSwitcher({ currentTheme, setTheme }) {

    return (
        <ControlButton
            onClick={() => {
                const newTheme = currentTheme === "light" ? "dark" : "light";
                setTheme(newTheme);
                document.documentElement.className = newTheme;
            }}

            className="theme-switcher react-flow__control-button"
        >
            {currentTheme === "light" ? (
                <ThemeIcon src="/light-mode.svg" alt="Dark Mode"/>
            ) : (
                <ThemeIcon src="/dark-mode.svg" alt="Light Mode"  style={{filter: "invert(100)"}}/>
            )}


        </ControlButton>
    );
}
