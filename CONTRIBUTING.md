# Contributing to Choriad

Thank you for your interest in contributing to Choriad! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards other contributors
- Accept constructive criticism gracefully

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct inappropriate in a professional setting

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

```bash
Node.js 18+
npm or yarn
Git
Supabase account (for testing)
Flutterwave test account
```

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork:**
```bash
git clone https://github.com/YOUR_USERNAME/choriad.git
cd choriad
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/choriad/choriad.git
```

4. **Install dependencies:**
```bash
npm install
```

5. **Set up environment:**
```bash
cp .env.example .env.local
# Fill in your API keys
```

6. **Start development server:**
```bash
npm run dev
```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm run test

# Test build
npm run build
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add worker profile verification"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 💻 Coding Standards

### TypeScript

- **Use TypeScript** for all new files
- Define proper types, avoid `any`
- Use interfaces for objects
- Export types when needed

```typescript
// ✅ Good
interface WorkerProfile {
  id: string;
  skills: string[];
  rating: number;
}

// ❌ Bad
const profile: any = { ... };
```

### React Components

- **Use functional components** with hooks
- **Server Components by default** (Next.js 15)
- Add `"use client"` only when needed
- Keep components small and focused

```typescript
// ✅ Good - Server Component
export default async function WorkerDashboard() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Good - Client Component (when needed)
"use client";
export function InteractiveMap() {
  const [location, setLocation] = useState(null);
  return <MapComponent />;
}
```

### File Naming

- **Components**: PascalCase (`WorkerCard.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Server Actions**: camelCase (`job.ts`)
- **API Routes**: lowercase (`route.ts`)

### Code Organization

```typescript
// 1. Imports (grouped)
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface Props {
  userId: string;
}

// 3. Component
export function Component({ userId }: Props) {
  // 4. Hooks
  const [data, setData] = useState(null);
  
  // 5. Functions
  const handleClick = () => { ... };
  
  // 6. Effects
  useEffect(() => { ... }, []);
  
  // 7. Render
  return <div>...</div>;
}
```

### Styling

- **Use Tailwind CSS** for styling
- Follow mobile-first approach
- Use shadcn/ui components
- Keep custom CSS minimal

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">

// ❌ Bad - Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### Server Actions

- Place in `app/actions/` directory
- Add `"use server"` directive
- Handle errors properly
- Return consistent response format

```typescript
"use server";

export async function updateWorkerProfile(data: ProfileData) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("workers")
      .update(data)
      .eq("id", userId);
    
    if (error) throw error;
    
    revalidatePath("/worker/profile");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(worker): add profile verification flow
fix(payments): resolve flutterwave webhook timeout
docs(api): update AI matching endpoint documentation
refactor(jobs): simplify job creation logic
test(bookings): add booking creation tests
```

### Good Commit Messages

```bash
✅ feat(auth): add OAuth login with Google
✅ fix(payment): handle failed webhook retries
✅ docs: update deployment instructions

❌ update code
❌ fix bug
❌ changes
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Build succeeds

### PR Title

Use the same format as commit messages:

```
feat(worker): add skill endorsement feature
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Screenshots
If applicable

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks**: Must pass CI/CD
2. **Code Review**: At least one approval required
3. **Testing**: Manually test critical features
4. **Merge**: Squash and merge to main

## 🧪 Testing Guidelines

### Unit Tests

Test individual functions and components:

```typescript
// utils.test.ts
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats Nigerian Naira correctly', () => {
    expect(formatCurrency(1000)).toBe('₦1,000');
  });
});
```

### Integration Tests

Test feature workflows:

```typescript
// booking.test.ts
describe('Booking Flow', () => {
  it('creates booking and processes payment', async () => {
    // Test end-to-end booking creation
  });
});
```

### Manual Testing Checklist

Before submitting PR, test:

#### As Client:
- [ ] Create job posting
- [ ] View AI worker matches
- [ ] Hire worker
- [ ] Process payment
- [ ] Leave review

#### As Worker:
- [ ] View available jobs
- [ ] Apply to job
- [ ] Receive booking notification
- [ ] Update profile

#### As Admin:
- [ ] View dashboard statistics
- [ ] Process worker payout
- [ ] Verify worker documents

## 📚 Documentation

### Code Comments

```typescript
// ✅ Good - Explains WHY
// Calculate worker payout (85% after platform fee)
const workerPayout = totalAmount * 0.85;

// ❌ Bad - States the obvious
// Set payout to amount times 0.85
const workerPayout = totalAmount * 0.85;
```

### JSDoc for Complex Functions

```typescript
/**
 * Process worker payout via Flutterwave
 * @param params - Payout parameters including amount and bank details
 * @returns Promise with success status and transfer ID
 * @throws Error if payment fails or bank details invalid
 */
export async function processWorkerPayout(params: PayoutParams) {
  // ...
}
```

### Update README

If your changes affect:
- Setup process
- API endpoints
- Configuration
- Features

Update the relevant section in README.md

### API Documentation

Document new endpoints:

```typescript
/**
 * POST /api/ai/match
 * 
 * Request:
 * {
 *   jobId: string
 * }
 * 
 * Response:
 * {
 *   matches: WorkerMatch[]
 * }
 */
```

## 🐛 Bug Reports

### Creating Issues

Use this template:

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Version: [e.g. 1.2.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

Use this template:

```markdown
**Feature Description**
Clear description of the feature

**Problem It Solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, etc.
```

## 🔒 Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead, email: security@choriad.com

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## 📞 Getting Help

- **Slack**: #choriad-dev
- **Email**: dev@choriad.com
- **Discussions**: GitHub Discussions

## 🎓 Learning Resources

### Next.js 15
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

### Flutterwave
- [API Documentation](https://developer.flutterwave.com/)
- [Webhook Guide](https://developer.flutterwave.com/docs/integration-guides/webhooks)

### AI Development
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI API](https://platform.openai.com/docs)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Choriad! 🎉