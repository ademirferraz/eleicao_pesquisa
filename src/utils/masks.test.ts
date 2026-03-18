import { describe, it, expect } from "vitest";

// Funções de formatação (copiadas do Register.tsx)
const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

const formatDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

describe("Mask Formatting Functions", () => {
  describe("formatCPF", () => {
    it("should format CPF correctly with dots and hyphen", () => {
      expect(formatCPF("12345678901")).toBe("123.456.789-01");
    });

    it("should handle partial CPF input", () => {
      expect(formatCPF("123")).toBe("123");
      expect(formatCPF("123456")).toBe("123.456");
      expect(formatCPF("123456789")).toBe("123.456.789");
    });

    it("should remove non-numeric characters", () => {
      expect(formatCPF("123.456.789-01")).toBe("123.456.789-01");
      expect(formatCPF("123 456 789 01")).toBe("123.456.789-01");
    });

    it("should limit to 11 digits", () => {
      expect(formatCPF("123456789012")).toBe("123.456.789-01");
    });

    it("should handle empty input", () => {
      expect(formatCPF("")).toBe("");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly with slashes", () => {
      expect(formatDate("15011990")).toBe("15/01/1990");
    });

    it("should handle partial date input", () => {
      expect(formatDate("15")).toBe("15");
      expect(formatDate("1501")).toBe("15/01");
    });

    it("should remove non-numeric characters", () => {
      expect(formatDate("15/01/1990")).toBe("15/01/1990");
      expect(formatDate("15-01-1990")).toBe("15/01/1990");
    });

    it("should limit to 8 digits", () => {
      expect(formatDate("150119901")).toBe("15/01/1990");
    });

    it("should handle empty input", () => {
      expect(formatDate("")).toBe("");
    });
  });
});
