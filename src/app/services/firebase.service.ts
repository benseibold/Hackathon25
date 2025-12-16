import { Injectable, inject } from '@angular/core';
import { collection, Firestore, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs } from '@angular/fire/firestore';
import {
  Auth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Recipient, Gift } from './budget';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore = inject(Firestore);
  private auth = inject(Auth);

  private usersCollection = collection(this.firestore, 'users');

  // Helper method to remove undefined values from objects
  private removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const clean: any = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        clean[key] = obj[key];
      }
    });
    return clean;
  }

  // Authentication methods
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): void {
    onAuthStateChanged(this.auth, callback);
  }

  async signInAnonymously(): Promise<User> {
    const userCredential = await signInAnonymously(this.auth);
    return userCredential.user;
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async saveUserData(userId: string, firstName: string, budget: number): Promise<void> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    await setDoc(userDoc, {
      firstName,
      totalBudget: budget,
      updatedAt: new Date(),
    });
  }

  async getUserData(userId: string): Promise<{ firstName: string; totalBudget: number } | null> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      return {
        firstName: data['firstName'],
        totalBudget: data['totalBudget'],
      };
    }
    return null;
  }

  async addRecipient(userId: string, recipient: Recipient): Promise<void> {
    const recipientsCollection = collection(this.firestore, `users/${userId}/recipients`);
    const recipientDoc = doc(recipientsCollection, recipient.id);
    const cleanRecipient = this.removeUndefined({
      ...recipient,
      updatedAt: new Date(),
    });
    await setDoc(recipientDoc, cleanRecipient);
  }

  async updateRecipient(userId: string, recipientId: string, updates: Partial<Recipient>): Promise<void> {
    const recipientDoc = doc(this.firestore, `users/${userId}/recipients/${recipientId}`);
    const cleanUpdates = this.removeUndefined({
      ...updates,
      updatedAt: new Date(),
    });
    await updateDoc(recipientDoc, cleanUpdates);
  }

  async getRecipients(userId: string): Promise<Recipient[]> {
    const recipientsCollection = collection(this.firestore, `users/${userId}/recipients`);
    const recipientsSnapshot = await getDocs(recipientsCollection);
    const recipients: Recipient[] = [];

    for (const recipientDoc of recipientsSnapshot.docs) {
      const recipientData = recipientDoc.data();

      // Get gifts for this recipient
      const gifts = await this.getGifts(userId, recipientDoc.id);

      // Calculate spent from actual gifts
      const spent = gifts.reduce((sum, gift) => sum + gift.price, 0);

      recipients.push({
        id: recipientDoc.id,
        name: recipientData['name'],
        budget: recipientData['budget'],
        spent: spent,
        gifts: gifts,
        age: recipientData['age'],
        gender: recipientData['gender'],
        interests: recipientData['interests'],
      });
    }

    return recipients;
  }

  async getRecipient(userId: string, recipientId: string): Promise<Recipient | null> {
    const recipientDoc = doc(this.firestore, `users/${userId}/recipients/${recipientId}`);
    const recipientSnapshot = await getDoc(recipientDoc);

    if (recipientSnapshot.exists()) {
      const recipientData = recipientSnapshot.data();
      const gifts = await this.getGifts(userId, recipientId);

      // Calculate spent from actual gifts
      const spent = gifts.reduce((sum, gift) => sum + gift.price, 0);

      return {
        id: recipientSnapshot.id,
        name: recipientData['name'],
        budget: recipientData['budget'],
        spent: spent,
        gifts: gifts,
        age: recipientData['age'],
        gender: recipientData['gender'],
        interests: recipientData['interests'],
      };
    }

    return null;
  }

  async addGift(userId: string, recipientId: string, gift: Gift): Promise<void> {
    const giftsCollection = collection(this.firestore, `users/${userId}/recipients/${recipientId}/gifts`);
    const giftDoc = doc(giftsCollection, gift.id);
    const cleanGift = this.removeUndefined({
      ...gift,
      updatedAt: new Date(),
    });
    await setDoc(giftDoc, cleanGift);
  }

  async updateGift(userId: string, recipientId: string, giftId: string, updates: Partial<Gift>): Promise<void> {
    const giftDoc = doc(this.firestore, `users/${userId}/recipients/${recipientId}/gifts/${giftId}`);
    const cleanUpdates = this.removeUndefined({
      ...updates,
      updatedAt: new Date(),
    });
    await updateDoc(giftDoc, cleanUpdates);
  }

  async deleteGift(userId: string, recipientId: string, giftId: string): Promise<void> {
    const giftDoc = doc(this.firestore, `users/${userId}/recipients/${recipientId}/gifts/${giftId}`);
    await deleteDoc(giftDoc);
  }

  async getGifts(userId: string, recipientId: string): Promise<Gift[]> {
    const giftsCollection = collection(this.firestore, `users/${userId}/recipients/${recipientId}/gifts`);
    const giftsSnapshot = await getDocs(giftsCollection);
    const gifts: Gift[] = [];

    giftsSnapshot.forEach((giftDoc) => {
      const giftData = giftDoc.data();
      gifts.push({
        id: giftDoc.id,
        name: giftData['name'],
        price: giftData['price'],
        recipientId: recipientId,
        storeName: giftData['storeName'],
        url: giftData['url'],
      });
    });

    return gifts;
  }

  async getGift(userId: string, recipientId: string, giftId: string): Promise<Gift | null> {
    const giftDoc = doc(this.firestore, `users/${userId}/recipients/${recipientId}/gifts/${giftId}`);
    const giftSnapshot = await getDoc(giftDoc);

    if (giftSnapshot.exists()) {
      const giftData = giftSnapshot.data();
      return {
        id: giftSnapshot.id,
        name: giftData['name'],
        price: giftData['price'],
        recipientId: recipientId,
        storeName: giftData['storeName'],
        url: giftData['url'],
      };
    }

    return null;
  }
}
