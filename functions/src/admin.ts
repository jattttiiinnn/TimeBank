import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

// Interface for user data
export interface UserRecord extends admin.auth.UserRecord {
  customClaims?: {
    admin?: boolean;
    [key: string]: any;
  };
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

// Interface for session data
export interface Session {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  teacher: {
    _id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Helper function to check if user is admin
const isAdmin = async (uid: string): Promise<boolean> => {
  try {
    const user = await admin.auth().getUser(uid);
    return !!user.customClaims?.admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get all users with pagination
export const getUsers = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  try {
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers(1000); // Adjust batch size as needed
    const users = listUsersResult.users.map(user => {
      const userRecord = user.toJSON() as UserRecord;
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims || {},
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
        },
      };
    });

    return { users };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch users',
      error
    );
  }
});

// Update user (including admin status)
export const updateUser = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { uid, ...updateData } = data;
  
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID is required'
    );
  }

  try {
    // Update user in Auth
    if (updateData.email || updateData.password || updateData.disabled !== undefined) {
      await admin.auth().updateUser(uid, {
        email: updateData.email,
        password: updateData.password,
        disabled: updateData.disabled,
      });
    }

    // Update custom claims (like admin role)
    if (updateData.customClaims) {
      await admin.auth().setCustomUserClaims(uid, updateData.customClaims);
    }

    // Get updated user data
    const user = await admin.auth().getUser(uid);
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      customClaims: user.customClaims || {},
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update user',
      error
    );
  }
});

// Delete user
export const deleteUser = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { uid } = data;
  
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID is required'
    );
  }

  try {
    // Delete user from Auth
    await admin.auth().deleteUser(uid);
    
    // Delete user data from Firestore (if you're using it)
    await admin.firestore().collection('users').doc(uid).delete();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete user',
      error
    );
  }
});

// Get all sessions with pagination
export const getSessions = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { limit = 100, startAfter } = data;
  
  try {
    let query = admin.firestore()
      .collection('sessions')
      .orderBy('startTime', 'desc')
      .limit(limit);
    
    if (startAfter) {
      const lastDoc = await admin.firestore().collection('sessions').doc(startAfter).get();
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    const sessions: Session[] = [];
    
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      sessions.push({
        _id: doc.id,
        ...doc.data(),
      } as Session);
    });
    
    return { sessions };
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch sessions',
      error
    );
  }
});

// Update session
export const updateSession = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { sessionId, ...updateData } = data;
  
  if (!sessionId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Session ID is required'
    );
  }

  try {
    const sessionRef = admin.firestore().collection('sessions').doc(sessionId);
    await sessionRef.update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    const updatedSession = await sessionRef.get();
    return {
      _id: updatedSession.id,
      ...updatedSession.data(),
    };
  } catch (error) {
    console.error('Error updating session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update session',
      error
    );
  }
});

// Delete session
export const deleteSession = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { sessionId } = data;
  
  if (!sessionId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Session ID is required'
    );
  }

  try {
    await admin.firestore().collection('sessions').doc(sessionId).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete session',
      error
    );
  }
});

// Get analytics data
export const getAnalytics = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { timeRange = 7 } = data; // Default to 7 days
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - timeRange);
  
  try {
    // Get user analytics
    const usersSnapshot = await admin.auth().listUsers();
    const users = usersSnapshot.users;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newThisWeek = users.filter(user => 
      user.metadata.creationTime && new Date(user.metadata.creationTime) >= oneWeekAgo
    ).length;
    
    const activeToday = users.filter(user => 
      user.metadata.lastSignInTime && new Date(user.metadata.lastSignInTime) >= today
    ).length;
    
    // Get session analytics
    const sessionsSnapshot = await admin.firestore()
      .collection('sessions')
      .where('startTime', '>=', startDate)
      .get();
    
    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length;
    
    // User growth data (last 30 days)
    const userGrowth = [];
    const userCounts = new Map<string, number>();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      userCounts.set(dateStr, 0);
    }
    
    users.forEach(user => {
      if (user.metadata.creationTime) {
        const createdDate = new Date(user.metadata.creationTime).toISOString().split('T')[0];
        if (userCounts.has(createdDate)) {
          userCounts.set(createdDate, (userCounts.get(createdDate) || 0) + 1);
        }
      }
    });
    
    let cumulativeCount = 0;
    for (const [date, count] of userCounts.entries()) {
      cumulativeCount += count;
      userGrowth.push({
        date,
        count: cumulativeCount,
      });
    }
    
    // Session activity data
    const sessionActivity = [];
    const sessionCounts = new Map<string, { completed: number; cancelled: number }>();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      sessionCounts.set(dateStr, { completed: 0, cancelled: 0 });
    }
    
    sessions.forEach(session => {
      if (session.startTime) {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        const counts = sessionCounts.get(sessionDate) || { completed: 0, cancelled: 0 };
        
        if (session.status === 'completed') {
          counts.completed++;
        } else if (session.status === 'cancelled') {
          counts.cancelled++;
        }
        
        sessionCounts.set(sessionDate, counts);
      }
    });
    
    for (const [date, counts] of sessionCounts.entries()) {
      sessionActivity.push({
        date,
        ...counts,
      });
    }
    
    // User roles
    const userRoles = [
      { role: 'Students', count: users.filter(u => !u.customClaims?.admin).length },
      { role: 'Teachers', count: users.filter(u => !u.customClaims?.admin).length / 2 }, // Example
      { role: 'Admins', count: users.filter(u => u.customClaims?.admin).length },
    ];
    
    // Session status
    const sessionStatus = [
      { status: 'Scheduled', count: upcomingSessions },
      { status: 'In Progress', count: sessions.filter(s => s.status === 'in-progress').length },
      { status: 'Completed', count: completedSessions },
      { status: 'Cancelled', count: cancelledSessions },
    ];
    
    return {
      users: {
        total: users.length,
        newThisWeek,
        activeToday,
      },
      sessions: {
        total: sessions.length,
        completed: completedSessions,
        cancelled: cancelledSessions,
        upcoming: upcomingSessions,
      },
      userGrowth,
      sessionActivity,
      userRoles,
      sessionStatus,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch analytics',
      error
    );
  }
});

// Set admin role for a user
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }

  const isUserAdmin = await isAdmin(context.auth.uid);
  if (!isUserAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }

  const { uid, admin: isAdminRole } = data;
  
  if (uid === undefined || isAdminRole === undefined) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID and admin status are required'
    );
  }

  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(uid, { admin: isAdminRole });
    
    // Invalidate user's token
    await admin.auth().revokeRefreshTokens(uid);
    
    return { success: true };
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set admin role',
      error
    );
  }
});
