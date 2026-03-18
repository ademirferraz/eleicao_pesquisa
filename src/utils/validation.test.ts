import { describe, it, expect } from "vitest";
import { isValidCPF, isValidDate, calculateAge, isValidVotingAge } from "./validation";

describe("Validation Functions", () => {
  describe("isValidCPF", () => {
    it("should validate a correct CPF", () => {
      // Valid CPF: 111.444.777-35
      expect(isValidCPF("11144477735")).toBe(true);
      expect(isValidCPF("111.444.777-35")).toBe(true);
    });

    it("should reject CPF with all same digits", () => {
      expect(isValidCPF("11111111111")).toBe(false);
      expect(isValidCPF("00000000000")).toBe(false);
    });

    it("should reject CPF with wrong length", () => {
      expect(isValidCPF("123456789")).toBe(false);
      expect(isValidCPF("123456789012")).toBe(false);
    });

    it("should reject CPF with invalid check digits", () => {
      expect(isValidCPF("11144477736")).toBe(false);
    });
  });

  describe("isValidDate", () => {
    it("should validate a correct date", () => {
      expect(isValidDate("15/01/1990")).toBe(true);
      expect(isValidDate("31/12/2000")).toBe(true);
    });

    it("should reject invalid day", () => {
      expect(isValidDate("32/01/1990")).toBe(false);
      expect(isValidDate("00/01/1990")).toBe(false);
    });

    it("should reject invalid month", () => {
      expect(isValidDate("15/13/1990")).toBe(false);
      expect(isValidDate("15/00/1990")).toBe(false);
    });

    it("should reject invalid year", () => {
      expect(isValidDate("15/01/1800")).toBe(false);
      expect(isValidDate("15/01/2050")).toBe(false);
    });

    it("should reject invalid day for month", () => {
      expect(isValidDate("31/02/2000")).toBe(false);
      expect(isValidDate("31/04/2000")).toBe(false);
    });
  });

  describe("calculateAge", () => {
    it("should calculate age correctly", () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthMonth = String(today.getMonth() + 1).padStart(2, "0");
      const birthDay = String(today.getDate()).padStart(2, "0");
      const dateString = `${birthDay}/${birthMonth}/${birthYear}`;
      
      expect(calculateAge(dateString)).toBe(25);
    });

    it("should return -1 for invalid date", () => {
      expect(calculateAge("32/01/1990")).toBe(-1);
      expect(calculateAge("15/13/1990")).toBe(-1);
    });
  });

  describe("isValidVotingAge", () => {
    it("should accept age >= 16", () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 16;
      const birthMonth = String(today.getMonth() + 1).padStart(2, "0");
      const birthDay = String(today.getDate()).padStart(2, "0");
      const dateString = `${birthDay}/${birthMonth}/${birthYear}`;
      
      expect(isValidVotingAge(dateString)).toBe(true);
    });

    it("should reject age < 16", () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 15;
      const birthMonth = String(today.getMonth() + 1).padStart(2, "0");
      const birthDay = String(today.getDate()).padStart(2, "0");
      const dateString = `${birthDay}/${birthMonth}/${birthYear}`;
      
      expect(isValidVotingAge(dateString)).toBe(false);
    });
  });
});
