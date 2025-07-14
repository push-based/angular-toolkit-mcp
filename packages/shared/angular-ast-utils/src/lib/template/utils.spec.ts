import {
  extractClassNamesFromNgClassAST,
  ngClassContainsClass,
  ngClassesIncludeClassName,
} from './utils';
import type {
  ASTWithSource,
  TmplAstElement,
} from '@angular/compiler' with { 'resolution-mode': 'import' };

let parseTemplate: typeof import('@angular/compiler').parseTemplate;

beforeAll(async () => {
  parseTemplate = (await import('@angular/compiler')).parseTemplate;
});

function parseNgClassExpression(expression: string): ASTWithSource {
  const template = `<div [ngClass]="${expression}"></div>`;
  const result = parseTemplate(template, 'test.html');
  const element = result.nodes[0] as TmplAstElement;
  const ngClassInput = element.inputs.find((input) => input.name === 'ngClass');
  return ngClassInput?.value as ASTWithSource;
}

describe('extractClassNamesFromNgClassAST', () => {
  it('should extract classes from array literals', () => {
    const expression = "['btn', 'btn-primary', someVariable]";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'btn',
      'btn-primary',
      'other',
    ]);

    expect(result).toEqual(['btn', 'btn-primary']);
  });

  it('should extract classes from object literals', () => {
    const expression =
      "{ 'btn': true, 'btn-primary': isActive, 'other-class': false }";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'btn',
      'btn-primary',
      'other-class',
    ]);

    expect(result).toEqual(['btn', 'btn-primary', 'other-class']);
  });

  it('should extract classes from string literals', () => {
    const expression = "'btn btn-primary active'";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'btn',
      'btn-primary',
      'active',
    ]);

    expect(result).toEqual(['btn', 'btn-primary', 'active']);
  });

  it('should extract classes from ternary expressions without false positives from conditions', () => {
    const expression =
      "option?.logo?.toLowerCase() === 'card' ? 'card-special' : 'card-normal'";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'card-special',
      'card-normal',
    ]);

    expect(result).toEqual(['card-special', 'card-normal']);
  });

  it('should not extract classes from binary comparison expressions', () => {
    const expression = "someValue === 'card' && otherValue !== 'btn'";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'btn',
    ]);

    expect(result).toEqual([]);
  });

  it('should handle complex nested expressions', () => {
    const expression =
      "[option?.logo?.toLowerCase() === 'card' ? 'card-active' : '', 'base-class']";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'card-active',
      'base-class',
    ]);

    expect(result).toEqual(['card-active', 'base-class']);
  });

  it('should handle object with conditional values', () => {
    const expression =
      "{ 'card': option?.logo?.toLowerCase() === 'card', 'btn': isButton }";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'btn',
    ]);

    expect(result).toEqual(['card', 'btn']);
  });

  it('should handle spaced class names in object keys', () => {
    const expression = "{ 'card special': true, 'btn primary': false }";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'special',
      'btn',
      'primary',
    ]);

    expect(result).toEqual(['card', 'special', 'btn', 'primary']);
  });

  it('should return empty array for non-matching classes', () => {
    const expression = "['other', 'different']";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'btn',
    ]);

    expect(result).toEqual([]);
  });

  it('should remove duplicates', () => {
    const expression = "['card', 'card', 'btn']";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'btn',
    ]);

    expect(result).toEqual(['card', 'btn']);
  });
});

describe('ngClassContainsClass', () => {
  it('should return true when class is found in AST', () => {
    const expression = "['btn', 'btn-primary']";
    const astWithSource = parseNgClassExpression(expression);

    expect(ngClassContainsClass(astWithSource, 'btn')).toBe(true);
    expect(ngClassContainsClass(astWithSource, 'btn-primary')).toBe(true);
  });

  it('should return false when class is not found in AST', () => {
    const expression = "['other', 'different']";
    const astWithSource = parseNgClassExpression(expression);

    expect(ngClassContainsClass(astWithSource, 'btn')).toBe(false);
  });

  it('should return false for classes in comparisons', () => {
    const expression =
      "option?.logo?.toLowerCase() === 'card' ? 'active' : 'inactive'";
    const astWithSource = parseNgClassExpression(expression);

    // Should not find 'card' since it's in a comparison, not a class assignment
    expect(ngClassContainsClass(astWithSource, 'card')).toBe(false);
    expect(ngClassContainsClass(astWithSource, 'active')).toBe(true);
  });
});

describe('AST-based ngClass parsing integration tests', () => {
  it('should handle the original problem case correctly', () => {
    const expression =
      "[option?.logo?.toLowerCase(), option?.logo?.toLowerCase() == 'card' ? mergedCardLogoClass : '']";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, ['card']);

    // Should NOT find 'card' from the comparison
    expect(result).toEqual([]);
  });

  it('should find card when actually used as a class', () => {
    const expression = "['card', 'other-class']";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, ['card']);

    expect(result).toEqual(['card']);
  });

  it('should handle complex real-world scenarios', () => {
    const expression =
      "{ 'card': isCard, 'btn': isButton, 'active': option?.logo?.toLowerCase() === 'card' }";
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'btn',
    ]);

    expect(result).toEqual(['card', 'btn']);
  });
});

describe('AST-based class binding parsing', () => {
  function parseClassExpression(expression: string): ASTWithSource {
    const template = `<div [class]="${expression}"></div>`;
    const result = parseTemplate(template, 'test.html');
    const element = result.nodes[0] as TmplAstElement;
    const classInput = element.inputs.find((input) => input.name === 'class');
    return classInput?.value as ASTWithSource;
  }

  it('should work the same for [class] bindings with false positive avoidance', () => {
    const expression =
      "option?.logo?.toLowerCase() == 'card' ? 'card-special' : 'other'";
    const astWithSource = parseClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'card-special',
    ]);

    expect(result).toEqual(['card-special']);
  });

  it('should handle simple string literals in [class] bindings', () => {
    const expression = "'card btn-primary'";
    const astWithSource = parseClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'btn-primary',
      'other',
    ]);

    expect(result).toEqual(['card', 'btn-primary']);
  });

  it('should handle ternary expressions in [class] bindings', () => {
    const expression = "isActive ? 'card active' : 'card inactive'";
    const astWithSource = parseClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'active',
      'inactive',
    ]);

    expect(result).toEqual(['card', 'active', 'inactive']);
  });
});

describe('AST-based interpolated class parsing', () => {
  function parseInterpolatedClassExpression(classValue: string): ASTWithSource {
    const template = `<div class="${classValue}"></div>`;
    const result = parseTemplate(template, 'test.html');
    const element = result.nodes[0] as TmplAstElement;
    const classInput = element.inputs.find((input) => input.name === 'class');
    return classInput?.value as ASTWithSource;
  }

  it('should extract classes from interpolated class attributes', () => {
    const classValue = 'count count-{{ size() }} other-class';
    const astWithSource = parseInterpolatedClassExpression(classValue);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'count',
      'other-class',
      'different',
    ]);

    expect(result).toEqual(['count', 'other-class']);
  });

  it('should handle interpolation with multiple dynamic parts', () => {
    const classValue = 'prefix {{ type }} middle {{ state }} suffix';
    const astWithSource = parseInterpolatedClassExpression(classValue);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'prefix',
      'middle',
      'suffix',
    ]);

    expect(result).toEqual(['prefix', 'middle', 'suffix']);
  });

  it('should handle interpolation with only static classes', () => {
    const classValue = 'btn btn-primary active';
    const astWithSource = parseInterpolatedClassExpression(classValue);

    // Static class attributes without interpolation don't create class inputs
    // They are handled as static attributes, not dynamic bindings
    expect(astWithSource).toBeUndefined();
  });

  it('should avoid false positives from dynamic expressions in interpolation', () => {
    const classValue = "base-class {{ condition ? 'card' : 'other' }}";
    const astWithSource = parseInterpolatedClassExpression(classValue);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'base-class',
      'card',
      'other',
    ]);

    expect(result).toEqual(['base-class']);
  });

  it('should handle the exact failing test case', () => {
    const classValue = 'count count-{{ size() }} other-class';
    const astWithSource = parseInterpolatedClassExpression(classValue);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'count',
    ]);

    expect(result).toEqual(['count']);
  });
});

describe('Real-world ngClass patterns from monorepo', () => {
  it('should handle complex object-style ngClass with multiple conditions', () => {
    // Based on promo filter popup component
    const expression = `{ 
      'disabled': selectedFilterIndexes?.totalCount === 0, 
      'pill-with-badge-v2': isOfferPageEnhanced,
      'ml-2': true,
      'promo-filter-apply': isOfferPageEnhanced 
    }`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'disabled',
      'pill-with-badge-v2',
      'ml-2',
      'promo-filter-apply',
      'btn-primary',
    ]);

    expect(result).toEqual([
      'disabled',
      'pill-with-badge-v2',
      'ml-2',
      'promo-filter-apply',
    ]);
  });

  it('should handle dark mode conditional classes', () => {
    const expression = `{ 
      'bg-body-10': !darkModeService.isEnabled, 
      'dark-mode-background': darkModeService.isEnabled 
    }`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'bg-body-10',
      'dark-mode-background',
      'other-class',
    ]);

    expect(result).toEqual(['bg-body-10', 'dark-mode-background']);
  });

  it('should handle simple boolean-based ngClass', () => {
    const expression = `{ 'offers-navigation-enable-v1': subNavigationV1Enabled }`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'offers-navigation-enable-v1',
      'other-class',
    ]);

    expect(result).toEqual(['offers-navigation-enable-v1']);
  });

  it('should handle responsive class conditions', () => {
    const expression = `{ 
      'mobile-card-middle': isMobile,
      'btn-sm': isSmallScreen,
      'form-width-75': !isMobile 
    }`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'mobile-card-middle',
      'btn-sm',
      'form-width-75',
    ]);

    expect(result).toEqual(['mobile-card-middle', 'btn-sm', 'form-width-75']);
  });

  it('should handle property-based class binding', () => {
    const expression = `filterByProduct?.messages?.producticonclass`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'icon-class',
      'ui-icon',
    ]);

    expect(result).toEqual([]);
  });

  it('should avoid false positives in complex comparison expressions', () => {
    const expression = `{ 
      'disabled': filtersByOffer?.count === 0,
      'badge-counter': selectedFilterIndexes?.totalCount > 0,
      'active': selectedFilters && selectedFilters.length > 0
    }`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'disabled',
      'badge-counter',
      'active',
      'count',
      'selectedFilters',
    ]);

    expect(result).toEqual(['disabled', 'badge-counter', 'active']);
  });

  it('should handle mixed static and conditional classes', () => {
    const expression = `[
      'navbar', 
      'navbar-expand-sm', 
      condition ? 'sub-nav-wrapper' : '',
      menuContainer?.class
    ]`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'navbar',
      'navbar-expand-sm',
      'sub-nav-wrapper',
      'other-class',
    ]);

    expect(result).toEqual(['navbar', 'navbar-expand-sm', 'sub-nav-wrapper']);
  });

  it('should handle the exact problematic pattern from the original issue', () => {
    // The exact pattern that was causing false positives
    const expression = `[
      option?.logo?.toLowerCase(), 
      option?.logo?.toLowerCase() == 'card' ? mergedCardLogoClass : '',
      'base-class'
    ]`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'card',
      'base-class',
      'other',
    ]);

    expect(result).toEqual(['base-class']);
  });

  it('should handle nested object with spaced class names', () => {
    // Based on filter popup patterns
    const expression = `{ 
      'filter-product-icon ui-icon': true,
      'ui-icon-size-lg': iconSize === 'large',
      'status-pills transparent': hasTransparentStyle
    }`;
    const astWithSource = parseNgClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'filter-product-icon',
      'ui-icon',
      'ui-icon-size-lg',
      'status-pills',
      'transparent',
      'large',
    ]);

    expect(result).toEqual([
      'filter-product-icon',
      'ui-icon',
      'ui-icon-size-lg',
      'status-pills',
      'transparent',
    ]);
  });
});

describe('Real-world [class] binding patterns', () => {
  // Helper function to extract AST from [class] expression
  function parseClassExpression(expression: string): ASTWithSource {
    const template = `<div [class]="${expression}"></div>`;
    const result = parseTemplate(template, 'test.html');
    const element = result.nodes[0] as TmplAstElement;
    const classInput = element.inputs.find((input) => input.name === 'class');
    return classInput?.value as ASTWithSource;
  }

  it('should handle conditional class strings', () => {
    const expression = `isActive ? 'nav-item active' : 'nav-item'`;
    const astWithSource = parseClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'nav-item',
      'active',
      'inactive',
    ]);

    expect(result).toEqual(['nav-item', 'active']);
  });

  it('should handle complex ternary with comparison false positive potential', () => {
    const expression = `userType === 'admin' ? 'admin-panel active' : userType === 'user' ? 'user-panel' : 'guest-panel'`;
    const astWithSource = parseClassExpression(expression);
    const result = extractClassNamesFromNgClassAST(astWithSource.ast, [
      'admin',
      'admin-panel',
      'active',
      'user',
      'user-panel',
      'guest-panel',
    ]);

    expect(result).toEqual([
      'admin-panel',
      'active',
      'user-panel',
      'guest-panel',
    ]);
  });
});

describe('Backward compatibility - ngClassesIncludeClassName', () => {
  it('should work with object expressions', () => {
    const expression = `{ 'btn': true, 'btn-primary': isActive }`;
    expect(ngClassesIncludeClassName(expression, 'btn')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'btn-primary')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'btn-secondary')).toBe(false);
  });

  it('should work with array expressions', () => {
    const expression = `['btn', 'btn-primary', condition ? 'active' : '']`;
    expect(ngClassesIncludeClassName(expression, 'btn')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'btn-primary')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'active')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'inactive')).toBe(false);
  });

  it('should work with string expressions', () => {
    const expression = `'btn btn-primary active'`;
    expect(ngClassesIncludeClassName(expression, 'btn')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'btn-primary')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'active')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'inactive')).toBe(false);
  });

  it('should handle basic string matching', () => {
    const expression = `{ 'btn': option?.logo?.toLowerCase() === 'card', 'active': true }`;
    expect(ngClassesIncludeClassName(expression, 'btn')).toBe(true);
    expect(ngClassesIncludeClassName(expression, 'active')).toBe(true);
  });

  it('should handle missing classes', () => {
    const expression = `{ 'other': true }`;
    expect(ngClassesIncludeClassName(expression, 'btn')).toBe(false);
  });
});
