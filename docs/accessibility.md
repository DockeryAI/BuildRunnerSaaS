# BuildRunner Accessibility Statement

BuildRunner is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

## Conformance Status

BuildRunner aims to conform to the [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/) at the AA level. These guidelines explain how to make web content more accessible to people with disabilities, and user-friendly for everyone.

### Current Compliance Level

**WCAG 2.1 AA Compliance**: We strive to meet and maintain WCAG 2.1 AA standards across all our web interfaces.

**Last Updated**: October 31, 2025  
**Next Review**: January 31, 2026

## Accessibility Features

### Keyboard Navigation
- All interactive elements are accessible via keyboard
- Logical tab order throughout the application
- Visible focus indicators on all focusable elements
- Skip links to main content and navigation

### Screen Reader Support
- Semantic HTML structure with proper headings
- ARIA labels and descriptions for complex UI elements
- Alternative text for images and icons
- Live regions for dynamic content updates

### Visual Design
- High contrast color schemes (minimum 4.5:1 ratio)
- Scalable text up to 200% without horizontal scrolling
- Clear visual hierarchy and consistent layout
- No reliance on color alone to convey information

### Motor Accessibility
- Large click targets (minimum 44x44 pixels)
- Generous spacing between interactive elements
- No time-sensitive actions without user control
- Support for voice control and switch navigation

## Supported Assistive Technologies

BuildRunner has been tested with the following assistive technologies:

### Screen Readers
- **NVDA** (Windows) - Latest version
- **JAWS** (Windows) - Version 2023 and later
- **VoiceOver** (macOS/iOS) - Built-in versions
- **TalkBack** (Android) - Latest version

### Browsers
- **Chrome** - Latest 2 versions
- **Firefox** - Latest 2 versions
- **Safari** - Latest 2 versions
- **Edge** - Latest 2 versions

### Input Methods
- Keyboard navigation
- Voice control software
- Switch navigation devices
- Eye-tracking systems

## Known Issues and Limitations

We are aware of the following accessibility issues and are working to address them:

### Current Issues
1. **Complex Data Tables**: Some analytics tables may need additional ARIA labels for better screen reader navigation
2. **Dynamic Content**: Certain real-time updates may not always announce properly to screen readers
3. **Third-party Integrations**: Some embedded content from external services may not meet our accessibility standards

### Planned Improvements
- Enhanced keyboard shortcuts for power users
- Improved high contrast mode support
- Better mobile accessibility for touch interfaces
- Additional language support for screen readers

## Testing and Validation

### Automated Testing
We use automated accessibility testing tools as part of our continuous integration:
- **axe-core**: Comprehensive accessibility rule engine
- **Lighthouse**: Google's accessibility audit tool
- **Pa11y**: Command-line accessibility testing

### Manual Testing
Our accessibility testing includes:
- Keyboard-only navigation testing
- Screen reader testing with multiple tools
- High contrast and zoom testing
- Color blindness simulation
- Motor impairment simulation

### User Testing
We regularly conduct usability testing with users who have disabilities to ensure our interfaces work well with assistive technologies.

## Feedback and Contact

We welcome your feedback on the accessibility of BuildRunner. Please let us know if you encounter accessibility barriers:

### Contact Methods
- **Email**: accessibility@buildrunner.com
- **Support Portal**: [https://support.buildrunner.com](https://support.buildrunner.com)
- **Phone**: +1 (555) 123-4567 (Monday-Friday, 9 AM - 5 PM PST)

### What to Include in Your Report
When reporting accessibility issues, please include:
1. **Page URL** where you encountered the issue
2. **Browser and version** you were using
3. **Assistive technology** (if applicable) and version
4. **Description** of the issue and what you expected to happen
5. **Steps to reproduce** the issue

### Response Time
We aim to respond to accessibility feedback within:
- **Critical issues**: 24 hours
- **High priority issues**: 3 business days
- **General feedback**: 5 business days

## Accessibility Resources

### For Users
- [WebAIM Screen Reader Testing Guide](https://webaim.org/articles/screenreader_testing/)
- [NVDA Screen Reader Download](https://www.nvaccess.org/download/)
- [Browser Accessibility Features](https://www.w3.org/WAI/users/browsing)

### For Developers
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Legal Information

This accessibility statement applies to the BuildRunner web application and associated services. It does not cover:
- Third-party content or services linked from our platform
- User-generated content that has not been moderated
- Legacy systems that are being phased out

### Compliance Monitoring
We monitor our accessibility compliance through:
- Regular automated testing in our CI/CD pipeline
- Quarterly manual accessibility audits
- Annual third-party accessibility assessments
- Ongoing user feedback and testing

### Enforcement Procedure
If you believe that content on BuildRunner violates accessibility standards, you may file a complaint through our standard support channels. We will investigate all complaints and take appropriate action.

## Updates to This Statement

This accessibility statement was created on October 31, 2025, using the [W3C Accessibility Statement Generator Tool](https://www.w3.org/WAI/planning/statements/). 

We review and update this statement:
- When we make significant changes to our platform
- At least once every 12 months
- When we receive feedback that indicates issues with our accessibility

### Version History
- **v1.0** (October 31, 2025): Initial accessibility statement
- **v1.1** (Planned January 2026): Updated after quarterly review

---

## Technical Implementation

### ARIA Implementation
BuildRunner implements ARIA (Accessible Rich Internet Applications) attributes throughout the interface:

```html
<!-- Example: Accessible form with proper labeling -->
<form role="form" aria-labelledby="form-title">
  <h2 id="form-title">Create New Project</h2>
  <div class="form-group">
    <label for="project-name">Project Name</label>
    <input 
      type="text" 
      id="project-name" 
      aria-required="true"
      aria-describedby="name-help"
    />
    <div id="name-help" class="help-text">
      Enter a descriptive name for your project
    </div>
  </div>
</form>
```

### Skip Links
Every page includes skip links for keyboard users:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#navigation" class="skip-link">Skip to navigation</a>
```

### Focus Management
We ensure proper focus management for dynamic content:
- Focus moves to new content when navigating
- Modal dialogs trap focus appropriately
- Focus returns to trigger element when closing modals

### Color and Contrast
All color combinations meet WCAG AA standards:
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **UI components**: 3:1 contrast ratio minimum

For questions about our accessibility implementation, contact our development team at dev@buildrunner.com.
