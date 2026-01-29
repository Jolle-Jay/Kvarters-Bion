# AI Chat Integration Documentation

## Overview

The AI chat functionality allows users to interact with an AI assistant (Devstral Small 2) through a chat interface. The backend proxies requests to the Nodehill AI API while prepending a customizable system prompt.

## Changes Made

### Backend Changes

#### 1. New Files Created

- **`backend/src/AiChatRoutes.cs`** - Main class handling AI chat routes
  - Implements POST `/api/chat` endpoint for chat completions
  - Loads configuration from `db-config.json`
  - Loads system prompt from `system-prompt.md`
  - Proxies requests to `https://ai-api.nodehill.com`

- **`backend/system-prompt.md`** - System prompt for the AI assistant
  - Markdown file containing the default system prompt
  - Can be edited to customize the AI assistant's behavior
  - Default content: "You are a helpful AI assistant. You are here to assist users with their questions and tasks."

#### 2. Modified Files

- **`backend/src/Server.cs`** (Line 14)
  - Added `AiChatRoutes.Start();` to register the AI chat routes

- **`backend/db-config.template.json`** (Line 9)
  - Added `"aiAccessToken": "your-ai-access-token"` field for API authentication

### Frontend Changes

#### 1. New Files Created

- **`src/parts/AiChat.tsx`** - React component for AI chat interface
  - Provides a complete chat UI with Bootstrap styling
  - Features:
    - Message history display
    - Text input with auto-resize
    - Send button with loading state
    - Auto-scroll to latest message
    - Keyboard shortcut (Enter to send, Shift+Enter for new line)

## Configuration

### 1. Add AI Access Token

Edit your `backend/db-config.json` file and add the `aiAccessToken` field:

```json
{
  "host": "your-host",
  "port": 4567,
  "username": "your-username",
  "password": "your-password",
  "database": "your-database",
  "createTablesIfNotExist": true,
  "seedDataIfEmpty": true,
  "aiAccessToken": "your-actual-token-here"
}
```

**Important:** Get your access token from your instructor. The token provides 5M tokens in / 1M tokens out per day.

### 2. Customize System Prompt (Optional)

Edit `backend/system-prompt.md` to change the AI assistant's behavior:

```markdown
You are a helpful AI assistant specialized in [your domain].
You provide concise and accurate responses to user questions.
```

## Using the AI Chat Component

### In a Page Component

To use the AI chat in any of your pages, simply import and render the component:

```tsx
import AiChat from '../parts/AiChat';

export default function MyPage() {
  return (
    <div>
      <h1>My Page with AI Chat</h1>
      <AiChat />
    </div>
  );
}
```

### In a Layout

You can also embed it in a sidebar or modal:

```tsx
import { Container, Row, Col } from 'react-bootstrap';
import AiChat from '../parts/AiChat';

export default function PageWithSidebar() {
  return (
    <Container fluid>
      <Row>
        <Col md={8}>
          {/* Main content */}
        </Col>
        <Col md={4}>
          <AiChat />
        </Col>
      </Row>
    </Container>
  );
}
```

## API Endpoints

### POST `/api/chat`

Sends a message to the AI and receives a response.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

**Response:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      }
    }
  ]
}
```

## Technical Details

### Backend Architecture

- **HttpClient**: Used for making requests to the AI API
- **Configuration**: Loaded from `db-config.json` in the static constructor
- **System Prompt**: Read from file at startup, prepended to all chat requests
- **Error Handling**: Catches and returns errors in standardized format using `RestResult.Parse()`

### Frontend Architecture

- **State Management**: Uses React hooks (useState, useEffect, useRef)
- **TypeScript**: Fully typed interfaces for messages and API responses
- **Bootstrap**: Uses React Bootstrap components for consistent styling
- **Auto-scroll**: Automatically scrolls to the latest message
- **Auto-resize**: Textarea grows/shrinks based on content

## Code Style Notes

- The C# class follows the same pattern as other route classes (e.g., `LoginRoutes.cs`)
- Uses the Dyndata library for dynamic objects (`Obj()`, `Arr()`)
- Follows the global usings pattern established in `GlobalUsings.cs`
- React component uses TypeScript and Bootstrap, matching the project style
- Component is reusable and self-contained in the `parts/` directory

## Removing the ai-api-playground Folder

Once you've verified that the integration works correctly, you can safely delete the `ai-api-playground` folder as all its functionality has been migrated to the main codebase.

```bash
# After testing, remove the temporary folder
rm -rf ai-api-playground
```

## Troubleshooting

### "aiAccessToken not found in db-config.json"

- Check that you've added the `aiAccessToken` field to your `db-config.json`
- Ensure the field name is spelled correctly (camelCase)

### "No system-prompt.md found"

- Verify that `system-prompt.md` exists in the `backend/` directory
- The backend will work without it, but won't prepend a system prompt

### Chat not working in frontend

- Check browser console for errors
- Verify backend is running on the expected port (default: 3001)
- Test the API endpoints directly using curl or Postman

### Quota issues

- Verify your access token is valid
- Check if you've exceeded your daily quota (1M in / 200K out)

