import { describe, it, expect } from 'vitest';
import { 
  assertCapTableGuardrails, 
  calculateEquitySuggestion, 
  validateProjectSettings,
  type CapTableState 
} from '../src/services/guardrails';

describe('Guardrail Service', () => {
  describe('assertCapTableGuardrails', () => {
    const validState: CapTableState = {
      owner: 40,
      alice: 20,
      reserve: 40,
      userTotal: 0
    };

    it('allows valid contribution within bounds', () => {
      expect(() => assertCapTableGuardrails(validState, 2.0)).not.toThrow();
    });

    it('enforces contribution minimum', () => {
      expect(() => assertCapTableGuardrails(validState, 0.1))
        .toThrow(/outside bounds 0\.5%-5%/);
    });

    it('enforces contribution maximum', () => {
      expect(() => assertCapTableGuardrails(validState, 6.0))
        .toThrow(/outside bounds 0\.5%-5%/);
    });

    it('enforces owner minimum', () => {
      const lowOwnerState = { ...validState, owner: 30 };
      expect(() => assertCapTableGuardrails(lowOwnerState, 1.0))
        .toThrow(/below minimum 35%/);
    });

    it('enforces Alice cap', () => {
      const highAliceState = { ...validState, alice: 30 };
      expect(() => assertCapTableGuardrails(highAliceState, 1.0))
        .toThrow(/exceeds cap 25%/);
    });

    it('enforces reserve sufficiency', () => {
      const lowReserveState = { ...validState, reserve: 1.0 };
      expect(() => assertCapTableGuardrails(lowReserveState, 2.0))
        .toThrow(/Insufficient reserve 1%/);
    });
  });

  describe('calculateEquitySuggestion', () => {
    it('calculates base rate for minimal effort/impact', () => {
      const suggestion = calculateEquitySuggestion(1, 1);
      expect(suggestion).toBe(0.5);
    });

    it('adds effort bonus', () => {
      const suggestion = calculateEquitySuggestion(40, 3);
      expect(suggestion).toBe(2.5); // 0.5 + 2.0 + 0
    });

    it('adds impact bonus', () => {
      const suggestion = calculateEquitySuggestion(10, 5);
      expect(suggestion).toBe(2.0); // 0.5 + 0.5 + 1.0 (impact bonus)
    });

    it('respects maximum bounds', () => {
      const suggestion = calculateEquitySuggestion(100, 5);
      expect(suggestion).toBe(3.5); // 0.5 + 2.0 + 1.0 (capped by effort bonus)
    });

    it('respects minimum bounds', () => {
      const suggestion = calculateEquitySuggestion(1, 1, 0.1);
      expect(suggestion).toBe(0.5); // Capped at min
    });
  });

  describe('validateProjectSettings', () => {
    it('accepts valid settings', () => {
      expect(() => validateProjectSettings(35, 25, 40)).not.toThrow();
    });

    it('rejects owner below minimum', () => {
      expect(() => validateProjectSettings(30, 25, 45))
        .toThrow(/cannot be below 35%/);
    });

    it('rejects Alice above cap', () => {
      expect(() => validateProjectSettings(35, 30, 35))
        .toThrow(/cannot exceed 25%/);
    });

    it('rejects percentages not summing to 100', () => {
      expect(() => validateProjectSettings(35, 25, 35))
        .toThrow(/must sum to 100%/);
    });
  });
});
