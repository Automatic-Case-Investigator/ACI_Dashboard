# Automation Settings Migration - Implementation Guide

## Overview
Your automation settings have been successfully migrated from browser local storage to use a backend API. This document outlines what's been done on the frontend and what's needed on the backend.

## Frontend Changes Summary

### New Files Created
- **`src/components/case_page/automations/automationSettingsApi.ts`** - API client for automation settings endpoints

### Modified Files
1. **`src/types/types.tsx`** - Added AutomationSettings types
2. **`src/pages/CasePage.tsx`** - Fetch settings on load, auto-save on change
3. **`src/pages/TaskPage.tsx`** - Fetch settings on load, save when investigation starts
4. **`src/components/case_page/task_preview/TaskPreview.tsx`** - Save settings when investigation starts

### Key Features
- ✅ Automatic backend sync when settings change
- ✅ Fallback to localStorage if backend unavailable
- ✅ Graceful error handling
- ✅ Token expiration detection
- ✅ Backward compatible with existing localStorage data

## Backend Implementation Required

### Endpoint 1: GET Automation Settings
```
GET /ai_backend/automation_settings/
Query Parameters: soar_id, org_id, case_id
Authorization: Bearer {token}
```

**Expected Response (200 OK):**
```json
{
  "settings": {
    "enableWebSearch": {
      "task_generation": false,
      "activity_generation": false,
      "siem_investigation": false
    },
    "earliestMagnitude": 1,
    "earliestUnit": "years",
    "vicinityMagnitude": 1,
    "vicinityUnit": "hours",
    "maxIterations": 3,
    "maxQueriesPerIteration": 5,
    "additionalNotes": ""
  },
  "updated_at": "2024-05-14T12:00:00Z"
}
```

**Error Response (e.g., invalid token):**
```json
{
  "code": "token_not_valid",
  "error": "Token is invalid or expired"
}
```

### Endpoint 2: Save/Update Automation Settings
```
PUT /ai_backend/automation_settings/
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "soar_id": "soar_123",
  "org_id": "org_456",
  "case_id": "case_789",
  "automation_settings": {
    "enableWebSearch": {
      "task_generation": false,
      "activity_generation": false,
      "siem_investigation": true
    },
    "earliestMagnitude": 2,
    "earliestUnit": "months",
    "vicinityMagnitude": 3,
    "vicinityUnit": "days",
    "maxIterations": 5,
    "maxQueriesPerIteration": 10,
    "additionalNotes": "Additional context here"
  }
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Settings saved successfully",
  "settings": {
    "enableWebSearch": {...},
    "earliestMagnitude": 2,
    ...
  },
  "updated_at": "2024-05-14T12:00:00Z"
}
```

**Error Response:**
```json
{
  "code": "token_not_valid",
  "error": "Token is invalid or expired"
}
```

## Database Schema

You'll need to create/update a table to store automation settings. Suggested structure:

```sql
CREATE TABLE automation_settings (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    soar_id VARCHAR(255) NOT NULL,
    org_id VARCHAR(255) NOT NULL,
    case_id VARCHAR(255) NOT NULL,
    enable_web_search_task_generation BOOLEAN DEFAULT FALSE,
    enable_web_search_activity_generation BOOLEAN DEFAULT FALSE,
    enable_web_search_siem_investigation BOOLEAN DEFAULT FALSE,
    earliest_magnitude INTEGER DEFAULT 1,
    earliest_unit VARCHAR(50) DEFAULT 'years',
    vicinity_magnitude INTEGER DEFAULT 1,
    vicinity_unit VARCHAR(50) DEFAULT 'hours',
    max_iterations INTEGER DEFAULT 3,
    max_queries_per_iteration INTEGER DEFAULT 5,
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_case_settings (soar_id, org_id, case_id),
    INDEX idx_case (soar_id, org_id, case_id)
);
```

## Implementation Notes

### Error Handling
- The frontend will log errors to console if API calls fail
- Settings will fall back to localStorage if backend is unavailable
- Token expiration (code: "token_not_valid") triggers automatic logout
- All fetch operations include proper error handling

### Data Consistency
- Settings are fetched fresh when navigating to case page
- Settings sync to backend whenever they change
- localStorage is always kept in sync as a backup
- No stale data issues due to automatic refresh on load

### User Experience
- No breaking changes - existing localStorage data will be used if backend not available
- Transparent migration - users don't need to do anything
- Settings persist across page refreshes and browser sessions
- Failed API calls don't disrupt user workflow (graceful degradation)

## Testing the Integration

1. **Test GET endpoint:**
   - Navigate to a case - should fetch settings from GET endpoint
   - Check browser network tab to verify API calls

2. **Test PUT endpoint:**
   - Change any automation setting on the case page
   - Should see PUT request in network tab within 300ms (debounced)
   - Verify data is saved correctly in database

3. **Test error handling:**
   - Simulate backend unavailability
   - Verify settings still work with localStorage fallback
   - Check console for error messages

4. **Test token handling:**
   - Make token expire
   - Change a setting
   - Should automatically logout on token error

## Future Enhancements

Potential improvements for future versions:
- Add settings sync across multiple browser tabs
- Add undo/redo for settings changes
- Add presets for common automation configurations
- Add settings history/audit log
- Add export/import settings functionality

---
**Questions?** Refer to the API client implementation in `src/components/case_page/automations/automationSettingsApi.ts` for exact request/response handling.
