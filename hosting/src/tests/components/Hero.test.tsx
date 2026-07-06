import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Hero } from "@/components/Hero";

describe("Hero", () => {
  it("renders the main headline and call to action", () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(screen.getByText(/Real Food/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your delivery address/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Find Food/i })).toBeInTheDocument();
  });

  it("displays the stats", () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );

    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("10k+")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
  });
});
