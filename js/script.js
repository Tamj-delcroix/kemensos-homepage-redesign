/* =========================================
   KEMENSOS HOMEPAGE REDESIGN
   Interactive UI
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // 1. ELEMENT REFERENCES
  // =========================================

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-navigation");
  const navLinks = document.querySelectorAll(".nav-link");

  const searchToggle = document.querySelector(".search-toggle");
  const searchPanel = document.querySelector(".search-panel");
  const searchForm = document.querySelector(".search-form");
  const searchInput = document.querySelector("#site-search");
  const searchFeedback = document.querySelector(".search-feedback");

  const searchableItems = document.querySelectorAll(".searchable-item");
  const resultsStatus = document.querySelector(".search-results-status");

  const currentYear = document.querySelector("#current-year");

  // =========================================
  // 2. AUTOMATIC FOOTER YEAR
  // =========================================

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // =========================================
  // 3. MOBILE NAVIGATION
  // =========================================

  function setMenuState(isOpen) {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Tutup navigasi" : "Buka navigasi",
    );

    navigation.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      setMenuState(!isOpen);
    });

    // Close the menu after choosing a navigation link.
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    // Close the menu when clicking outside the header.
    document.addEventListener("click", (event) => {
      const clickedInsideHeader = event.target.closest(".site-header");

      if (!clickedInsideHeader) {
        setMenuState(false);
      }
    });

    // Close the mobile menu with Escape.
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuToggle.getAttribute("aria-expanded") === "true"
      ) {
        setMenuState(false);
        menuToggle.focus();
      }
    });

    // Reset the mobile menu when switching back to desktop.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        setMenuState(false);
      }
    });
  }

  // =========================================
  // 4. ACTIVE NAVIGATION LINK
  // =========================================

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((item) => {
        item.classList.remove("active");
        item.removeAttribute("aria-current");
      });

      link.classList.add("active");
      link.setAttribute("aria-current", "location");
    });
  });

  // =========================================
  // 5. SEARCH PANEL
  // =========================================

  function setSearchPanelState(isOpen) {
    if (!searchToggle || !searchPanel) return;

    searchToggle.setAttribute("aria-expanded", String(isOpen));
    searchToggle.setAttribute(
      "aria-label",
      isOpen ? "Tutup pencarian" : "Buka pencarian",
    );

    searchPanel.hidden = !isOpen;

    if (isOpen && searchInput) {
      searchInput.focus();
    }
  }

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      const isOpen = searchToggle.getAttribute("aria-expanded") === "true";

      setSearchPanelState(!isOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        searchToggle.getAttribute("aria-expanded") === "true"
      ) {
        setSearchPanelState(false);
        searchToggle.focus();
      }
    });
  }

  // =========================================
  // 6. SEARCH PAGE CONTENT
  // =========================================

  function normalizeText(value) {
    return value
      .toLocaleLowerCase("id-ID")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function resetSearch() {
    searchableItems.forEach((item) => {
      item.classList.remove("search-hidden", "search-match");
    });

    if (searchFeedback) {
      searchFeedback.textContent = "";
    }

    if (resultsStatus) {
      resultsStatus.textContent = "";
    }
  }

  function searchPage(query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      resetSearch();
      return;
    }

    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    let matchCount = 0;
    let firstMatch = null;

    searchableItems.forEach((item) => {
      const content = normalizeText(
        `${item.textContent} ${item.dataset.search || ""}`,
      );

      // Every search term must appear in the item.
      const isMatch = terms.every((term) => content.includes(term));

      item.classList.toggle("search-match", isMatch);
      item.classList.toggle("search-hidden", !isMatch);

      if (isMatch) {
        matchCount += 1;

        if (!firstMatch) {
          firstMatch = item;
        }
      }
    });

    if (searchFeedback) {
      searchFeedback.textContent =
        matchCount > 0
          ? `${matchCount} hasil ditemukan untuk "${query}".`
          : `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`;
    }

    if (resultsStatus) {
      resultsStatus.textContent =
        matchCount > 0
          ? `${matchCount} hasil pencarian ditemukan.`
          : "Tidak ada hasil pencarian.";
    }

    if (firstMatch) {
      firstMatch.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    }
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const query = searchInput.value.trim();

      if (!query) {
        if (searchFeedback) {
          searchFeedback.textContent = "Masukkan kata kunci yang ingin dicari.";
        }

        searchInput.focus();
        return;
      }

      searchPage(query);
    });

    searchInput.addEventListener("input", () => {
      if (!searchInput.value.trim()) {
        resetSearch();
      }
    });
  }

  // =========================================
  // 7. CLEAR SEARCH WHEN CLOSING PANEL
  // =========================================

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener("click", () => {
      const willClose = searchToggle.getAttribute("aria-expanded") === "true";

      if (willClose) {
        resetSearch();

        if (searchInput) {
          searchInput.value = "";
        }
      }
    });
  }

  // =========================================
  // 8. CLOSE SEARCH WHEN CLICKING OUTSIDE
  // =========================================

  document.addEventListener("click", (event) => {
    if (!searchToggle || !searchPanel) return;

    const clickedSearch =
      event.target.closest(".search-toggle") ||
      event.target.closest(".search-panel");

    if (!clickedSearch && !searchPanel.hidden) {
      setSearchPanelState(false);
    }
  });

  // =========================================
  // 9. FOOTER BACK-TO-TOP LINK
  // =========================================

  const backToTopLink = document.querySelector(
    '.footer-bottom a[href="#home"]',
  );

  if (backToTopLink) {
    backToTopLink.addEventListener("click", (event) => {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });

      history.replaceState(null, "", "#home");
    });
  }

  // =========================================
  // 10. EXTERNAL LINKS
  // =========================================

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });
});
