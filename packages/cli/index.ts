#!/usr/bin/env bun

import React from "react";
import { render } from "ink";
import { App } from "./src/App.js";

// Render the CLI app using Ink
const app = React.createElement(App);
render(app);