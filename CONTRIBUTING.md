# Contributing to Kiosk QR Kiosk Catalog

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Keep discussions professional

## How to Contribute

### Reporting Bugs

**Before submitting:**
1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Gather relevant information

**When reporting:**
- Use a clear, descriptive title
- Describe the expected vs actual behavior
- Provide steps to reproduce
- Include screenshots if relevant
- Specify browser, OS, and device info
- Include console errors if any

**Template:**
```markdown
**Bug Description:**
Clear description of the issue

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Device: Touch screen kiosk
- Screen size: 1920x1080

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Paste any error messages]
```

### Suggesting Features

**Before suggesting:**
- Check ROADMAP.md for planned features
- Search existing feature requests
- Consider if it fits the minimal kiosk focus

**When suggesting:**
- Use a clear, descriptive title
- Explain the use case and benefits
- Describe the proposed solution
- Provide examples or mockups if possible
- Consider backward compatibility

**Template:**
```markdown
**Feature Description:**
Brief summary of the feature

**Use Case:**
Why is this needed? What problem does it solve?

**Proposed Solution:**
How should it work?

**Alternatives Considered:**
Other ways to achieve this

**Additional Context:**
Screenshots, examples, or related features
```

### Pull Requests

**Before starting:**
1. Fork the repository
2. Create a new branch from `main`
3. Check if the feature is already being worked on

**Branch naming:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code improvements

**Development workflow:**

1. **Clone and setup:**
```bash
git clone https://github.com/yourusername/Kiosk QR-kiosk.git
cd Kiosk QR-kiosk
pnpm install
```

2. **Create branch:**
```bash
git checkout -b feature/my-new-feature
```

3. **Make changes:**
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed
- Test thoroughly

4. **Test your changes:**
```bash
pnpm run dev  # Test in development
pnpm run build  # Test production build
```

5. **Commit:**
```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit message format:**
```
type: short description

Longer description if needed

Fixes #issue-number
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build process or tooling changes

6. **Push and create PR:**
```bash
git push origin feature/my-new-feature
```

Then open a pull request on GitHub.

**PR Guidelines:**
- Use a clear, descriptive title
- Reference related issues
- Describe what changed and why
- Include screenshots for UI changes
- Ensure CI checks pass
- Be responsive to feedback

**PR Template:**
```markdown
## Description
Brief description of changes

## Related Issue
Fixes #issue-number

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots
[If applicable]

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tested on touch device
- [ ] Works in all supported browsers
```

## Development Guidelines

### Code Style

**TypeScript:**
```typescript
// ✓ Good
export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div className="product-card">
      {/* Component content */}
    </div>
  );
}

// ✗ Avoid
export function productCard(props) {
  return <div>{props.product.name}</div>
}
```

**Naming Conventions:**
- Components: PascalCase (`ProductCard.tsx`)
- Functions: camelCase (`filterProducts`)
- Constants: UPPER_SNAKE_CASE (`MAX_PRODUCTS`)
- CSS classes: kebab-case or Tailwind utilities

**File Organization:**
```
/ComponentName
  ComponentName.tsx       # Main component
  ComponentName.test.tsx  # Tests (if added)
  index.ts               # Exports
```

**Imports Order:**
1. React imports
2. Third-party imports
3. Internal imports (components, utils)
4. Type imports
5. Styles

```typescript
import { useState } from 'react';
import { motion } from 'motion/react';

import { KioskButton } from '../components/kiosk/KioskButton';
import { useI18n } from '../../contexts/I18nContext';
import { Product } from '../../data/products';
```

### Component Guidelines

**Props Interface:**
```typescript
interface ComponentProps {
  // Required props first
  id: string;
  title: string;
  
  // Optional props
  description?: string;
  onClick?: () => void;
  
  // Children last
  children?: ReactNode;
}
```

**Component Structure:**
```typescript
export function Component({ id, title, onClick }: ComponentProps) {
  // 1. Hooks
  const { t } = useI18n();
  const [state, setState] = useState(false);

  // 2. Derived state / Memos
  const computed = useMemo(() => /* ... */, []);

  // 3. Handlers
  const handleClick = () => {
    onClick?.();
  };

  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Styling Guidelines

**Tailwind Usage:**
```typescript
// ✓ Good - Semantic grouping
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-white rounded-lg
  hover:bg-gray-100 transition-colors
">
```

**Responsive Design:**
```typescript
// ✓ Good - Mobile-first
<div className="
  grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4
">

// ✗ Avoid - Desktop-first
<div className="
  lg:grid-cols-4 
  md:grid-cols-3 
  grid-cols-2
">
```

**Custom Styles:**
- Use Tailwind utilities first
- Add custom CSS only when necessary
- Keep styles in theme.css or component-scoped

### Performance Guidelines

**Memoization:**
```typescript
// ✓ Use for expensive calculations
const filtered = useMemo(
  () => products.filter(/* ... */),
  [products, filters]
);

// ✓ Use for callbacks passed to children
const handleClick = useCallback(
  () => { /* ... */ },
  [dependencies]
);
```

**Image Optimization:**
```typescript
// ✓ Good - Lazy load, proper alt
<img
  src={product.imageUrl}
  alt={product.title}
  loading="lazy"
  className="object-cover"
/>
```

### Accessibility Guidelines

**Touch Targets:**
```typescript
// ✓ Minimum 52px for kiosk use
<button className="h-14 min-w-[140px]">
```

**Semantic HTML:**
```typescript
// ✓ Good
<button onClick={handleClick}>Action</button>

// ✗ Avoid
<div onClick={handleClick}>Action</div>
```

**ARIA Labels:**
```typescript
// ✓ Add when needed
<button aria-label="Close dialog">
  <X className="w-6 h-6" />
</button>
```

## Testing (Future)

When tests are added:

```typescript
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Documentation

**Code Comments:**
```typescript
/**
 * Filters products based on multiple criteria
 * @param products - Array of products to filter
 * @param criteria - Filter criteria object
 * @returns Filtered product array
 */
export function filterProducts(
  products: Product[],
  criteria: FilterCriteria
): Product[] {
  // Implementation
}
```

**Update docs when:**
- Adding new features
- Changing configuration
- Modifying behavior
- Adding dependencies

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to repository
5. Create GitHub release
6. Deploy to production

## Questions?

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Kiosk QR Kiosk Catalog! 🎉
