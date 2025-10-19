# ISO 27001 Readiness Studio

Advanced, interactive compliance tracking and assessment tool built with React + TypeScript.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark theme
- ⚡ **Fast & Interactive** - Real-time updates, no page reloads
- 📊 **Advanced Dashboard** - Charts, graphs, and progress tracking
- 🔍 **Smart Search** - Filter controls by title, code, description, or tags
- 💾 **Data Persistence** - LocalStorage for offline work
- 📥 **Export/Import** - Save and share assessments
- 🎯 **Type-Safe** - Full TypeScript support
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Recharts** - Beautiful charts
- **Lucide React** - Modern icons
- **Date-fns** - Date utilities

## Getting Started

### Install Dependencies

```bash
cd iso-studio
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3347`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Select Framework** - Click on ISO 27001:2022 or CMMC 2.0
2. **Browse Controls** - See all 93 controls with search
3. **Assess Controls** - Click a control to assess it
4. **Update Status** - Set as Ready, Partial, or Missing
5. **Assign Owner** - Add responsible person
6. **Set Due Date** - Track deadlines
7. **Add Notes** - Document implementation details
8. **Save** - All data persists automatically
9. **View Dashboard** - See progress charts and statistics
10. **Export** - Download assessment as JSON

## API Integration

The app connects to the backend API at `http://localhost:3346/api/iso/`:
- `/frameworks` - Get all frameworks
- `/frameworks/:id/controls` - Get controls for framework
- `/controls` - Get all controls

## Data Storage

All assessments are stored in browser LocalStorage:
- Key: `iso_project`
- Format: JSON
- Persists across sessions
- Can be exported/imported

## Project Structure

```
iso-studio/
├── src/
│   ├── components/       # React components
│   │   ├── FrameworkPanel.tsx
│   │   ├── ControlsPanel.tsx
│   │   ├── InspectorPanel.tsx
│   │   ├── StatsDashboard.tsx
│   │   └── Panel.css
│   ├── types.ts          # TypeScript types
│   ├── App.tsx           # Main app component
│   ├── App.css           # App styles
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features in Detail

### Studio Tab
- Three-panel layout (Frameworks, Controls, Inspector)
- Real-time search and filtering
- Interactive control cards
- Form-based assessment
- Status indicators (✅ ⚠️ ❌)
- Tag display
- Owner assignment
- Due date tracking
- Risk and effort scoring
- Notes and documentation

### Dashboard Tab
- Overall readiness percentage
- Control statistics (Ready, Partial, Missing)
- Status distribution chart (pie chart)
- Domain progress chart (stacked bar)
- Progress bar visualization
- Real-time updates

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT

## Author

AliceSolutionsGroup

