/**
 * Component Catalog Generator
 * Lists available UI components for Claude to use
 */

export class ComponentCatalogGenerator {

  /**
   * Generate component catalog
   */
  generate(): string {
    return `# Component Catalog

*Available components for use in this project*

---

## shadcn/ui Components

### Buttons
\`\`\`tsx
import { Button } from '@/components/ui/button'

<Button variant="default | destructive | outline | ghost">
  Click me
</Button>
\`\`\`

**Variants:** default, destructive, outline, secondary, ghost, link
**Sizes:** default, sm, lg, icon

### Forms

**Input**
\`\`\`tsx
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="Enter text..." />
\`\`\`

**Textarea**
\`\`\`tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="Enter long text..." />
\`\`\`

**Select**
\`\`\`tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
\`\`\`

**Checkbox**
\`\`\`tsx
import { Checkbox } from '@/components/ui/checkbox'

<Checkbox id="terms" />
\`\`\`

**Radio Group**
\`\`\`tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

<RadioGroup>
  <RadioGroupItem value="option1" id="opt1" />
</RadioGroup>
\`\`\`

### Layout

**Card**
\`\`\`tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
\`\`\`

**Separator**
\`\`\`tsx
import { Separator } from '@/components/ui/separator'

<Separator />
\`\`\`

### Overlays

**Dialog (Modal)**
\`\`\`tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
\`\`\`

**Popover**
\`\`\`tsx
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
\`\`\`

**Tooltip**
\`\`\`tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\`

### Feedback

**Toast**
\`\`\`tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

toast({
  title: "Success",
  description: "Your action was successful",
})
\`\`\`

**Alert**
\`\`\`tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

<Alert>
  <AlertTitle>Title</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
\`\`\`

**Badge**
\`\`\`tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default | secondary | destructive | outline">Badge</Badge>
\`\`\`

**Progress**
\`\`\`tsx
import { Progress } from '@/components/ui/progress'

<Progress value={60} />
\`\`\`

### Navigation

**Tabs**
\`\`\`tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
\`\`\`

**Dropdown Menu**
\`\`\`tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
\`\`\`

### Data Display

**Table**
\`\`\`tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\`

**Avatar**
\`\`\`tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
\`\`\`

---

## Icons (Lucide React)

\`\`\`tsx
import { Check, X, Plus, Minus, ArrowRight, ... } from 'lucide-react'

<Check className="w-4 h-4" />
\`\`\`

**Available:** 1000+ icons from lucide.dev

---

## Animations (Framer Motion)

\`\`\`tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
\`\`\`

---

## Usage Guidelines

1. **Always prefer shadcn/ui components** over building from scratch
2. **Compose components** - combine primitives to build complex UIs
3. **Follow design system** - use design tokens for colors/spacing
4. **Accessibility built-in** - shadcn/ui components are WCAG compliant
5. **Customization** - components can be styled with className prop

---

## Custom Components

*Custom components created during this build will be listed here*

---

*This catalog is updated as the build progresses*
`;
  }
}

export const componentCatalogGenerator = new ComponentCatalogGenerator();
