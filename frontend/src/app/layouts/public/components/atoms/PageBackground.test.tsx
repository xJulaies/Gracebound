import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { saveTheme } from "../../../../../shared/theme/theme";
import { PAGE_BACKGROUND_URLS } from "../../../../../shared/theme/pageBackgroundAssets";
import { PageBackground } from "./PageBackground";

beforeEach(() => {
  document.documentElement.dataset.theme = "night";
  localStorage.clear();
});

describe("PageBackground", () => {
  it("loads only the initial theme artwork until the theme changes", () => {
    const { container } = render(<PageBackground />);

    expect(getImageSources(container)).toEqual([PAGE_BACKGROUND_URLS.night.desktop]);

    act(() => saveTheme("grace"));

    expect(getImageSources(container)).toEqual([
      PAGE_BACKGROUND_URLS.grace.desktop,
      PAGE_BACKGROUND_URLS.night.desktop,
    ]);
  });
});

function getImageSources(container: HTMLElement) {
  return Array.from(container.querySelectorAll("img"), ({ src }) => src);
}
