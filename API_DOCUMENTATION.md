# AD Construction - Project Management API Documentation

## Backend API Endpoints

The backend server runs on `http://localhost:5000` and provides the following endpoints:

### Projects API (`/projects`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/projects` | Get all projects | None | `{ "projects": [...] }` |
| GET | `/projects/:id` | Get project by ID | None | `{ "project": {...} }` |
| POST | `/projects` | Create new project | Project data | `{ "project": {...} }` |
| PUT | `/projects/:id` | Update project | Project data | `{ "project": {...} }` |
| DELETE | `/projects/:id` | Delete project | None | `{ "message": "Project deleted successfully" }` |

### Project Data Structure

```json
{
  "name": "string (required)",
  "client": "string (required)",
  "status": "string (required) - Planning, In Progress, Completed, On Hold",
  "startDate": "date (required)",
  "endDate": "date (required)",
  "budget": "number (required)",
  "completion": "number (required) - 0-100"
}
```

## Frontend Features

### Project Management Interface
- **View Projects**: Display all projects in a table format
- **Add Project**: Create new projects with a modal form
- **Edit Project**: Update existing projects
- **Delete Project**: Remove projects from the system
- **Real-time Updates**: Automatic refresh after operations
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations

### UI Components
- **Project Table**: Shows project details with progress bars
- **Add/Edit Modal**: Form for creating and editing projects
- **Search & Filter**: Interface for finding specific projects
- **Responsive Design**: Works on different screen sizes

## Getting Started

### Backend Setup
1. Navigate to the Backend directory
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Server will run on `http://localhost:5000`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Application will open at `http://localhost:3000`

### Database
- Uses MongoDB Atlas (cloud database)
- Connection string configured in `Backend/app.js`
- No additional setup required

## API Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a message field:
```json
{
  "message": "Error description"
}
```

## Frontend Error Handling

- Network errors are caught and displayed to users
- Loading states prevent multiple simultaneous operations
- Form validation ensures data integrity
- User-friendly error messages with dismiss option
