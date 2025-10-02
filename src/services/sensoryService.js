import { db } from '../config/firebase.client';
import { collection, doc, addDoc, getDocs, setDoc, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';

// Sensory Tools and Strategies Data
export const sensoryToolsData = {
  visual: {
    title: 'Visual Comfort',
    items: [
      {
        id: 'lights',
        title: 'Light Sensitivity',
        description: 'Adjust brightness and reduce glare',
        icon: 'lightbulb-outline',
        tips: ['Dim lights', 'Use natural lighting', 'Avoid fluorescent lights'],
        strategies: [
          'Use blue light filters',
          'Install dimmer switches',
          'Wear sunglasses indoors',
          'Use warm-colored bulbs'
        ]
      },
      {
        id: 'colors',
        title: 'Color Therapy',
        description: 'Calming color patterns',
        icon: 'palette',
        tips: ['Focus on blue tones', 'Avoid bright colors', 'Use soft gradients'],
        strategies: [
          'Use blue and green colors',
          'Avoid bright red and yellow',
          'Create color-coded systems',
          'Use pastel colors'
        ]
      },
      {
        id: 'patterns',
        title: 'Pattern Management',
        description: 'Handle visual patterns and clutter',
        icon: 'view-grid',
        tips: ['Minimize visual clutter', 'Use simple patterns', 'Create organized spaces'],
        strategies: [
          'Use solid colors instead of patterns',
          'Organize items in straight lines',
          'Use minimal decorations',
          'Create visual boundaries'
        ]
      }
    ]
  },
  audio: {
    title: 'Audio Comfort',
    items: [
      {
        id: 'noise',
        title: 'Noise Management',
        description: 'Control environmental sounds',
        icon: 'volume-medium',
        tips: ['Use noise-canceling headphones', 'Find quiet spaces', 'Create white noise'],
        strategies: [
          'Use noise-canceling headphones',
          'Create white noise with apps',
          'Find quiet workspaces',
          'Use earplugs when needed'
        ]
      },
      {
        id: 'music',
        title: 'Calming Sounds',
        description: 'Soothing audio experiences',
        icon: 'music-note',
        tips: ['Listen to nature sounds', 'Use gentle music', 'Avoid sudden noises'],
        strategies: [
          'Listen to nature sounds',
          'Use instrumental music',
          'Create sound playlists',
          'Use binaural beats'
        ]
      },
      {
        id: 'voice',
        title: 'Voice Sensitivity',
        description: 'Manage voice and speech sounds',
        icon: 'account-voice',
        tips: ['Use text communication', 'Request quiet conversations', 'Find quiet meeting spaces'],
        strategies: [
          'Use text-based communication',
          'Request quiet meeting spaces',
          'Use noise-canceling features',
          'Schedule calls during quiet hours'
        ]
      }
    ]
  },
  touch: {
    title: 'Tactile Comfort',
    items: [
      {
        id: 'texture',
        title: 'Texture Management',
        description: 'Comfortable textures and materials',
        icon: 'hand-peace',
        tips: ['Use soft fabrics', 'Avoid irritating materials', 'Find comfortable clothing'],
        strategies: [
          'Use soft, natural fabrics',
          'Avoid scratchy materials',
          'Test textures before buying',
          'Keep backup comfortable items'
        ]
      },
      {
        id: 'pressure',
        title: 'Deep Pressure',
        description: 'Calming pressure techniques',
        icon: 'hand',
        tips: ['Use weighted blankets', 'Try pressure vests', 'Practice gentle squeezing'],
        strategies: [
          'Use weighted blankets',
          'Try compression clothing',
          'Practice deep pressure exercises',
          'Use massage tools'
        ]
      },
      {
        id: 'temperature',
        title: 'Temperature Sensitivity',
        description: 'Manage temperature preferences',
        icon: 'thermometer',
        tips: ['Maintain comfortable temperature', 'Use temperature-regulating clothing', 'Have temperature control options'],
        strategies: [
          'Keep temperature control devices',
          'Use temperature-regulating clothing',
          'Have backup temperature options',
          'Monitor temperature preferences'
        ]
      }
    ]
  },
  movement: {
    title: 'Movement Comfort',
    items: [
      {
        id: 'balance',
        title: 'Balance Activities',
        description: 'Grounding exercises',
        icon: 'meditation',
        tips: ['Practice slow movements', 'Use rocking motions', 'Try balance exercises'],
        strategies: [
          'Practice slow, deliberate movements',
          'Use rocking chairs or swings',
          'Try balance exercises',
          'Use weighted items for grounding'
        ]
      },
      {
        id: 'fidget',
        title: 'Fidget Tools',
        description: 'Movement-based calming tools',
        icon: 'rotate-3d',
        tips: ['Use fidget spinners', 'Try stress balls', 'Practice hand exercises'],
        strategies: [
          'Use fidget spinners',
          'Try stress balls or putty',
          'Practice hand exercises',
          'Use chewable items if needed'
        ]
      },
      {
        id: 'space',
        title: 'Personal Space',
        description: 'Manage personal space needs',
        icon: 'account-group',
        tips: ['Maintain comfortable distance', 'Use visual boundaries', 'Communicate space needs'],
        strategies: [
          'Maintain comfortable distance from others',
          'Use visual boundaries',
          'Communicate space needs clearly',
          'Find quiet, spacious areas'
        ]
      }
    ]
  }
};

// Sensory Service Functions
export const sensoryService = {
  // Get user's sensory preferences
  async getUserPreferences(userId) {
    try {
      const q = query(collection(db, 'sensory_preferences'), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      const preferences = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: preferences, error: null };
    } catch (error) {
      console.error('Error fetching sensory preferences:', error);
      return { data: null, error };
    }
  },

  // Save or update sensory preference
  async saveSensoryPreference(userId, sensoryType, sensitivityLevel, triggers = [], copeStrategies = []) {
    try {
      const docId = `${userId}_${sensoryType}`;
      const prefRef = doc(db, 'sensory_preferences', docId);
      await setDoc(prefRef, {
        user_id: userId,
        sensory_type: sensoryType,
        sensitivity_level: sensitivityLevel,
        triggers,
        cope_strategies: copeStrategies,
        updated_at: new Date().toISOString()
      }, { merge: true });
      return { data: { id: docId }, error: null };
    } catch (error) {
      console.error('Error saving sensory preference:', error);
      return { data: null, error };
    }
  },

  // Get sensory tools by category
  getSensoryTools(category = 'all') {
    if (category === 'all') {
      return Object.values(sensoryToolsData);
    }
    return sensoryToolsData[category] ? [sensoryToolsData[category]] : [];
  },

  // Get all sensory categories
  getSensoryCategories() {
    return Object.keys(sensoryToolsData).map(category => ({
      key: category,
      title: sensoryToolsData[category].title,
      icon: this.getCategoryIcon(category)
    }));
  },

  // Get category icon
  getCategoryIcon(category) {
    const icons = {
      visual: 'eye-outline',
      audio: 'ear-hearing',
      touch: 'hand-peace',
      movement: 'run'
    };
    return icons[category] || 'apps';
  },

  // Track sensory overload event
  async trackSensoryEvent(userId, sensoryType, intensity, triggers, copingStrategies, notes = '') {
    try {
      const eventRef = await addDoc(collection(db, 'sensory_events'), {
        user_id: userId,
        sensory_type: sensoryType,
        intensity_level: intensity,
        triggers,
        coping_strategies: copingStrategies,
        notes,
        created_at: new Date().toISOString()
      });
      return { data: { id: eventRef.id }, error: null };
    } catch (error) {
      console.error('Error tracking sensory event:', error);
      return { data: null, error };
    }
  },

  // Get user's sensory history
  async getSensoryHistory(userId, limitCount = 10) {
    try {
      const q = query(
        collection(db, 'sensory_events'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        firestoreLimit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { data: events, error: null };
    } catch (error) {
      console.error('Error fetching sensory history:', error);
      return { data: null, error };
    }
  },

  // Get recommended strategies based on user preferences
  async getRecommendedStrategies(userId) {
    try {
      const { data: preferences, error: prefError } = await this.getUserPreferences(userId);
      
      if (prefError) throw prefError;

      const recommendations = {};
      
      preferences.data?.forEach(pref => {
        const category = pref.sensory_type;
        if (sensoryToolsData[category]) {
          recommendations[category] = {
            sensitivity: pref.sensitivity_level,
            triggers: pref.triggers || [],
            strategies: pref.coping_strategies || [],
            tools: sensoryToolsData[category].items
          };
        }
      });

      return { data: recommendations, error: null };
    } catch (error) {
      console.error('Error getting recommended strategies:', error);
      return { data: null, error };
    }
  }
};

export default sensoryService; 
