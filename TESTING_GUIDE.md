# 🧪 Testing Guide - New UI

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
cd medical-platform-nextjs
npm run dev
```

The app will be available at: `http://localhost:3000`

---

## 📋 Test Checklist

### ✅ Landing Page Tests (/)

#### Navigation Bar
- [ ] Logo displays correctly
- [ ] "Features" link scrolls to features section
- [ ] "How It Works" link scrolls to how-it-works section
- [ ] "Pricing" link scrolls to pricing section
- [ ] "About" link scrolls to about section
- [ ] "Sign In" button goes to /login
- [ ] "Get Started" button goes to /register
- [ ] If logged in, shows "Go to Dashboard" button

#### Hero Section
- [ ] Headline displays correctly
- [ ] Subheadline is readable
- [ ] "Start Free Trial" button works
- [ ] "Watch Demo" button scrolls to how-it-works
- [ ] Trust indicators visible
- [ ] Dashboard preview mockup displays

#### Features Section
- [ ] All 6 feature cards display
- [ ] Icons show correctly
- [ ] Text is readable
- [ ] Cards have hover effects

#### How It Works Section
- [ ] 3 steps display correctly
- [ ] Step numbers visible
- [ ] Icons show correctly
- [ ] Text is clear

#### Pricing Section
- [ ] 3 pricing tiers display
- [ ] Free plan shows correctly
- [ ] Pro plan highlighted as "Popular"
- [ ] Enterprise plan shows "Custom"
- [ ] All "Get Started" buttons work
- [ ] "Contact Sales" link works

#### Stats Section
- [ ] 4 stat cards display
- [ ] Numbers are large and visible
- [ ] Labels are clear

#### CTA Section
- [ ] Background gradient displays
- [ ] Text is white and readable
- [ ] "Get Started Now" button works

#### Footer
- [ ] Logo displays
- [ ] All links work
- [ ] Copyright text shows
- [ ] Footer is organized in columns

#### Responsive
- [ ] Mobile menu works (< 768px)
- [ ] Tablet layout looks good (768px - 1024px)
- [ ] Desktop layout looks good (> 1024px)

---

### ✅ Login Page Tests (/login)

#### Layout
- [ ] Navigation bar displays
- [ ] Logo links back to home
- [ ] "Back to Home" link works
- [ ] Form is centered
- [ ] Card has shadow and border

#### Form
- [ ] Email input works
- [ ] Password input works
- [ ] "Sign In" button works
- [ ] Loading spinner shows when submitting
- [ ] Error messages display correctly
- [ ] "Sign up for free" link goes to /register

#### Functionality
- [ ] Can login with valid credentials
- [ ] Shows error with invalid credentials
- [ ] Redirects to /dashboard after login
- [ ] Form validation works

#### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works

---

### ✅ Register Page Tests (/register)

#### Layout
- [ ] Navigation bar displays
- [ ] Logo links back to home
- [ ] "Back to Home" link works
- [ ] Form is centered
- [ ] Card has shadow and border

#### Form
- [ ] Full Name input works
- [ ] Email input works
- [ ] Role dropdown works (Doctor/Patient)
- [ ] Specialization shows for Doctor role
- [ ] Specialization hides for Patient role
- [ ] Password input works
- [ ] Confirm Password input works
- [ ] "Create Account" button works
- [ ] Loading spinner shows when submitting
- [ ] Error messages display correctly
- [ ] "Sign in here" link goes to /login

#### Functionality
- [ ] Can register with valid data
- [ ] Shows error if passwords don't match
- [ ] Shows error if password < 6 characters
- [ ] Shows error if email already exists
- [ ] Redirects to /login after registration
- [ ] Form validation works

#### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works

---

### ✅ Dashboard Tests (/dashboard)

#### Navigation Bar
- [ ] Logo displays and links to home
- [ ] Quick nav buttons show all tabs
- [ ] Active tab is highlighted
- [ ] XAI toggle works
- [ ] References toggle works
- [ ] User profile displays
- [ ] User name shows
- [ ] Logout button works
- [ ] Mobile menu button shows on mobile
- [ ] Mobile menu opens/closes

#### Welcome Banner
- [ ] Shows on Dashboard tab only
- [ ] Displays user name
- [ ] Has gradient background
- [ ] Text is white and readable

#### Tab Navigation
- [ ] Dashboard tab works
- [ ] Upload & Analysis tab works
- [ ] Collaboration tab works
- [ ] Q&A tab works
- [ ] Reports tab works
- [ ] Active tab is highlighted
- [ ] Content changes when switching tabs

#### Dashboard Tab Content
- [ ] Welcome message shows
- [ ] Stats cards display
- [ ] Quick action buttons work
- [ ] Recent activity shows
- [ ] Tips section displays

#### Upload Tab Content
- [ ] File upload area works
- [ ] Can select files
- [ ] Preview shows after selection
- [ ] Analyze button appears
- [ ] Analysis runs correctly
- [ ] Results display properly
- [ ] Heatmap shows (if XAI enabled)
- [ ] References show (if enabled)

#### Collaboration Tab Content
- [ ] Chat rooms list displays
- [ ] Can create new room
- [ ] Can join existing room
- [ ] Messages display
- [ ] Can send messages
- [ ] Real-time updates work

#### Q&A Tab Content
- [ ] Q&A rooms list displays
- [ ] Can create new room
- [ ] Can ask questions
- [ ] Answers display
- [ ] Context is relevant

#### Reports Tab Content
- [ ] Reports list displays
- [ ] Can view report details
- [ ] Can download PDF
- [ ] Can delete reports

#### Responsive
- [ ] Mobile menu works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] All tabs work on mobile

---

## 🔍 Detailed Testing Scenarios

### Scenario 1: New User Registration
1. Go to landing page (/)
2. Click "Get Started"
3. Fill registration form
4. Submit
5. Verify redirect to login
6. Login with new credentials
7. Verify redirect to dashboard

### Scenario 2: Existing User Login
1. Go to landing page (/)
2. Click "Sign In"
3. Enter credentials
4. Submit
5. Verify redirect to dashboard
6. Verify user name displays

### Scenario 3: Image Analysis
1. Login to dashboard
2. Go to Upload tab
3. Select medical image
4. Click Analyze
5. Wait for results
6. Verify analysis displays
7. Verify findings show
8. Verify keywords show
9. Check heatmap (if XAI enabled)
10. Check references (if enabled)

### Scenario 4: Collaboration
1. Login to dashboard
2. Go to Collaboration tab
3. Create new chat room
4. Enter room
5. Send message
6. Verify message appears
7. Start consultation
8. Verify specialist responses

### Scenario 5: Q&A System
1. Login to dashboard
2. Go to Q&A tab
3. Create new Q&A room
4. Ask question about report
5. Verify answer appears
6. Verify context is relevant

### Scenario 6: Report Generation
1. Login to dashboard
2. Go to Reports tab
3. View report list
4. Click on a report
5. Verify details display
6. Download PDF
7. Verify PDF opens correctly

---

## 🐛 Common Issues & Solutions

### Issue: Page not loading
**Solution:** 
- Check if dev server is running
- Check console for errors
- Clear browser cache
- Restart dev server

### Issue: Login not working
**Solution:**
- Check MongoDB connection
- Verify .env variables
- Check user exists in database
- Check password is correct

### Issue: Images not uploading
**Solution:**
- Check file size (< 50MB)
- Check file type (JPEG, PNG, DICOM)
- Check OpenAI API key
- Check network connection

### Issue: Styles not applying
**Solution:**
- Check Tailwind CSS is configured
- Run `npm run dev` again
- Clear browser cache
- Check for CSS conflicts

### Issue: Navigation not working
**Solution:**
- Check Next.js routing
- Verify file structure
- Check for JavaScript errors
- Restart dev server

---

## 📊 Performance Testing

### Page Load Times
- [ ] Landing page loads < 2s
- [ ] Dashboard loads < 3s
- [ ] Login page loads < 1s
- [ ] Register page loads < 1s

### API Response Times
- [ ] Image analysis < 10s
- [ ] Chat messages < 1s
- [ ] Q&A answers < 5s
- [ ] Report generation < 3s

### User Experience
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No flickering
- [ ] Responsive interactions

---

## 🔐 Security Testing

### Authentication
- [ ] Cannot access dashboard without login
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Cannot access other users' data

### Input Validation
- [ ] Email validation works
- [ ] Password requirements enforced
- [ ] File type validation works
- [ ] XSS protection active

### API Security
- [ ] API routes require authentication
- [ ] CORS configured correctly
- [ ] Rate limiting works
- [ ] Error messages don't leak info

---

## 📱 Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet

### Tablet Browsers
- [ ] iPad Safari
- [ ] Android Chrome

---

## ✅ Final Checklist

### Before Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] All links working
- [ ] All forms working
- [ ] All images loading
- [ ] All styles applying
- [ ] Responsive on all devices
- [ ] Fast load times
- [ ] SEO optimized
- [ ] Accessible
- [ ] Secure

### Environment Variables
- [ ] DATABASE_URL set
- [ ] NEXTAUTH_SECRET set
- [ ] OPENAI_API_KEY set
- [ ] All optional vars set (if needed)

### Production Ready
- [ ] Build succeeds (`npm run build`)
- [ ] No build errors
- [ ] No build warnings
- [ ] Production env vars set
- [ ] Database accessible
- [ ] APIs accessible

---

## 🎉 Testing Complete!

If all tests pass, your application is ready for:
- ✅ Production deployment
- ✅ User testing
- ✅ Demo presentations
- ✅ Client showcases
- ✅ Investor pitches

---

## 📞 Need Help?

If you encounter issues:
1. Check console for errors
2. Check network tab for failed requests
3. Check MongoDB connection
4. Check API keys
5. Restart dev server
6. Clear browser cache
7. Check file permissions

---

**Happy Testing! 🚀**
