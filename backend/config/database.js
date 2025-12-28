// ============================================
// DATABASE CONFIGURATION
// Supports both Firebase and Supabase
// ============================================

const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ============================================
// FIREBASE SETUP
// ============================================

let firebaseDb = null;

if (process.env.FIREBASE_PROJECT_ID) {
    try {
        // Initialize Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            }),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });

        firebaseDb = admin.firestore();
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
    }
}

// ============================================
// SUPABASE SETUP
// ============================================

let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        console.log('✅ Supabase initialized successfully');
    } catch (error) {
        console.error('❌ Supabase initialization error:', error.message);
    }
}

// ============================================
// DATABASE OPERATIONS (Abstract Layer)
// Works with both Firebase and Supabase
// ============================================

const db = {
    // ============================================
    // CREATE
    // ============================================
    async create(collection, data) {
        try {
            if (firebaseDb) {
                const docRef = await firebaseDb.collection(collection).add({
                    ...data,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                return { id: docRef.id, ...data };
            }

            if (supabase) {
                const { data: result, error } = await supabase
                    .from(collection)
                    .insert([{
                        ...data,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return result;
            }

            throw new Error('No database configured');
        } catch (error) {
            console.error(`Error creating in ${collection}:`, error);
            throw error;
        }
    },

    // ============================================
    // READ (Get by ID)
    // ============================================
    async getById(collection, id) {
        try {
            if (firebaseDb) {
                const doc = await firebaseDb.collection(collection).doc(id).get();
                if (!doc.exists) return null;
                return { id: doc.id, ...doc.data() };
            }

            if (supabase) {
                const { data, error } = await supabase
                    .from(collection)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return data;
            }

            throw new Error('No database configured');
        } catch (error) {
            console.error(`Error getting ${collection}/${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // READ (Get All with filters)
    // ============================================
    async getAll(collection, filters = {}) {
        try {
            if (firebaseDb) {
                let query = firebaseDb.collection(collection);

                // Apply filters
                Object.keys(filters).forEach(key => {
                    query = query.where(key, '==', filters[key]);
                });

                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            if (supabase) {
                let query = supabase.from(collection).select('*');

                // Apply filters
                Object.keys(filters).forEach(key => {
                    query = query.eq(key, filters[key]);
                });

                const { data, error } = await query;
                if (error) throw error;
                return data;
            }

            throw new Error('No database configured');
        } catch (error) {
            console.error(`Error getting all from ${collection}:`, error);
            throw error;
        }
    },

    // ============================================
    // UPDATE
    // ============================================
    async update(collection, id, data) {
        try {
            if (firebaseDb) {
                await firebaseDb.collection(collection).doc(id).update({
                    ...data,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                return { id, ...data };
            }

            if (supabase) {
                const { data: result, error } = await supabase
                    .from(collection)
                    .update({
                        ...data,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return result;
            }

            throw new Error('No database configured');
        } catch (error) {
            console.error(`Error updating ${collection}/${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // DELETE
    // ============================================
    async delete(collection, id) {
        try {
            if (firebaseDb) {
                await firebaseDb.collection(collection).doc(id).delete();
                return { success: true };
            }

            if (supabase) {
                const { error } = await supabase
                    .from(collection)
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };
            }

            throw new Error('No database configured');
        } catch (error) {
            console.error(`Error deleting ${collection}/${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // QUERY (Advanced)
    // ============================================
    async query(collection, options = {}) {
        try {
            if (firebaseDb) {
                let query = firebaseDb.collection(collection);

                // Where clauses
                if (options.where) {
                    options.where.forEach(([field, operator, value]) => {
                        query = query.where(field, operator, value);
                    });
                }

                // Order by
                if (options.orderBy) {
                    query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
                }

                // Limit
                if (options.limit) {
                    query = query.limit(options.limit);
                }

                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            if (supabase) {
                let query = supabase.from(collection).select('*');

                // Where clauses
                if (options.where) {
                    options.where.forEach(([field, operator, value]) => {
                        switch (operator) {
                            case '==':
                                query = query.eq(field, value);
                                break;
                            case '>':
                                query = query.gt(field, value);
                                break;
                            case '<':
                                query = query.lt(field, value);
                                break;
                            case '>=':
                                query = query.gte(field, value);
                                break;
                            case '<=':
                                query = query.lte(field, value);
                                break;
                        }
                    });
                }

                // Order by
                if (options.orderBy) {
                    query = query.order(
                        options.orderBy.field,
                        { ascending: options.orderBy.direction === 'asc' }
                    );
                }

                // Limit
                if (options.limit) {
                    query = query.limit(options.limit);
                }

                const { data, error } = await query;
                if (error) throw error;
                return data;
            }

            throw new Error('No database configured');
        } catch (error) {
            console.error(`Error querying ${collection}:`, error);
            throw error;
        }
    }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
    db,
    firebaseDb,
    firebaseAdmin: admin,
    supabase
};
