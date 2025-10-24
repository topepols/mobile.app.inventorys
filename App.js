import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { db, auth } from "./firebaseConfig";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  collection,
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function App() {
  const [page, setPage] = useState("login");
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLogs, setReportLogs] = useState([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 📸 Camera permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  // 🔄 Real-time listener for inventory
  useEffect(() => {
    const inventoryCol = collection(db, "inventory");
    const unsubscribe = onSnapshot(inventoryCol, (snapshot) => {
      const firestoreItems = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setItems(firestoreItems);
      console.log("📦 Firestore inventory updated:", firestoreItems);
    });
    return () => unsubscribe();
  }, []);

  // 🔄 Real-time listener for reports
  useEffect(() => {
    const reportsCol = collection(db, "reports");
    const unsubscribe = onSnapshot(reportsCol, (snapshot) => {
      const logs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setReportLogs(
        logs.sort(
          (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
        )
      );
      console.log("🧾 Firestore reports updated:", logs);
    });
    return () => unsubscribe();
  }, []);

  // ➕ Add or Update Item + Log to Firestore
  const saveItem = async () => {
    if (!name || !date || !price) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      if (editId) {
        const docRef = doc(db, "inventory", editId);
        await updateDoc(docRef, { name, date, price });
        Alert.alert("Updated", "Item updated successfully!");

        await addDoc(collection(db, "reports"), {
          action: "update",
          name,
          date,
          price,
          user: auth.currentUser?.email || "Unknown",
          timestamp: new Date(),
        });

        setEditId(null);
      } else {
        await addDoc(collection(db, "inventory"), { name, date, price });
        Alert.alert("Added", "Item added to inventory!");

        await addDoc(collection(db, "reports"), {
          action: "add",
          name,
          date,
          price,
          user: auth.currentUser?.email || "Unknown",
          timestamp: new Date(),
        });
      }

      setName("");
      setDate("");
      setPrice("");
      setReport(null);
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Error", "Failed to save item.");
    }
  };

  // ✏️ Edit Item
  const editItem = (item) => {
    setName(item.name);
    setDate(item.date);
    setPrice(item.price);
    setEditId(item.id);
  };

  // 🗑️ Delete Item
  const deleteItem = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const docRef = doc(db, "inventory", id);
            await deleteDoc(docRef);
            Alert.alert("Deleted", "Item removed from inventory.");
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Failed to delete item.");
          }
        },
      },
    ]);
  };

  // 🧾 Generate Simple Report (local summary)
  const generateReport = () => {
    if (items.length === 0) return;
    const totalItems = items.length;
    const totalValue = items.reduce(
      (sum, item) => sum + parseFloat(item.price || 0),
      0
    );
    const latestItem = items[items.length - 1];
    setReport({ totalItems, totalValue, latestItem });
  };

  // 🔍 Search Filter
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.date.toLowerCase().includes(search.toLowerCase()) ||
      item.price.includes(search)
  );

  // 🔐 Login with Firebase Auth
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Login successful!");
      setPage("home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* LOGIN PAGE */}
      {page === "login" && (
        <View style={styles.page}>
          <Text style={styles.header}>
            Double JDG Inventory Management System
          </Text>
          <View style={styles.loginBox}>
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={[styles.btn, styles.loginBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MAIN APP */}
      {page !== "login" && (
        <View style={styles.app}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => setPage("home")}
            >
              <Text style={styles.sideText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => setPage("inventory")}
            >
              <Text style={styles.sideText}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => setPage("reports")}
            >
              <Text style={styles.sideText}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sideBtn, styles.logoutBtn]}
              onPress={() => setPage("login")}
            >
              <Text style={styles.sideText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <Text style={styles.header}>
              Double JDG Inventory Management System
            </Text>

            {/* Home Page */}
            {page === "home" && (
              <View style={styles.content}>
                <Text style={styles.title}>Welcome!</Text>
                <View style={styles.cards}>
                  <View style={styles.card}>
                    <Text>Total Items: {items.length}</Text>
                  </View>
                  <View style={styles.card}>
                    <Text>Low Stock: 5</Text>
                  </View>
                  <View style={styles.card}>
                    <Text>Recent Sales: 15</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Inventory Page */}
            {page === "inventory" && (
              <View style={styles.content}>
                <Text style={styles.title}>Inventory</Text>
                <View style={styles.formRow}>
                  <TextInput
                    placeholder="Name"
                    style={styles.inputSmall}
                    value={name}
                    onChangeText={setName}
                  />
                  <TextInput
                    placeholder="Date"
                    style={styles.inputSmall}
                    value={date}
                    onChangeText={setDate}
                  />
                  <TextInput
                    placeholder="Price"
                    style={styles.inputSmall}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.btn} onPress={saveItem}>
                    <Text style={styles.btnText}>
                      {editId ? "Update" : "Add"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={generateReport}>
                    <Text style={styles.btnText}>Generate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#007bff" }]}
                    onPress={() => setPage("camera")}
                  >
                    <Text style={styles.btnText}>Camera</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Search"
                  style={styles.inputSearch}
                  value={search}
                  onChangeText={setSearch}
                />

                <FlatList
                  data={filteredItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.row}>
                      <Text style={styles.rowText}>{item.name}</Text>
                      <Text style={styles.rowText}>{item.date}</Text>
                      <Text style={styles.rowText}>₱{item.price}</Text>
                      <View style={styles.rowBtns}>
                        <TouchableOpacity
                          style={[styles.btn, styles.editBtn]}
                          onPress={() => editItem(item)}
                        >
                          <Text style={styles.btnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btn, styles.deleteBtn]}
                          onPress={() => deleteItem(item.id)}
                        >
                          <Text style={styles.btnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Reports Page */}
            {page === "reports" && (
              <View style={styles.content}>
                <Text style={styles.title}>Reports</Text>
                <FlatList
                  data={reportLogs}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.row}>
                      <Text style={styles.rowText}>
                        {item.action.toUpperCase()} — {item.name} (₱{item.price})
                      </Text>
                      <Text style={styles.rowText}>
                        By: {item.user || "Unknown"} •{" "}
                        {item.timestamp?.seconds
                          ? new Date(
                              item.timestamp.seconds * 1000
                            ).toLocaleString()
                          : "N/A"}
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}

            {/* ✅ Camera Page with Safe Permission Check */}
{page === "camera" && (
  <View style={styles.content}>
    <Text style={styles.title}>Camera (QR Scanner)</Text>

    {/* Step 1: Handle permission */}
    {!permission ? (
      <Text>Checking camera permission...</Text>
    ) : !permission.granted ? (
      <View style={{ alignItems: "center", marginTop: 50 }}>
        <Text style={{ marginBottom: 15 }}>
          Camera permission is required to scan QR codes.
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#007bff" }]}
          onPress={requestPermission}
        >
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <>
        {/* Step 2: Show Camera once permission is granted */}
        <CameraView
          style={{ flex: 1, width: "100%" }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            scanned
              ? undefined
              : (result) => {
                  if (result && result.data) {
                    setScanned(true);
                    Alert.alert("QR Detected", `Data: ${result.data}`);
                  }
                }
          }
        />

        {/* Step 3: Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: "#007bff", marginHorizontal: 5 },
            ]}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.btnText}>Scan Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: "#c97c1b", marginHorizontal: 5 },
            ]}
            onPress={() => setPage("inventory")}
          >
            <Text style={styles.btnText}>Back to Inventory</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </View>
)}

          </View>
        </View>
      )}
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#b6ffb6" },
  header: {
    backgroundColor: "#0b3c4c",
    color: "#fff",
    padding: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  page: { flex: 1, justifyContent: "center" },
  loginBox: {
    backgroundColor: "#eee",
    margin: 20,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  loginBtn: { backgroundColor: "#c97c1b", marginTop: 10 },
  app: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 120,
    backgroundColor: "#28e17f",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sideBtn: {
    backgroundColor: "#c97c1b",
    marginVertical: 8,
    padding: 12,
    borderRadius: 5,
    width: "100%",
  },
  sideText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  logoutBtn: { backgroundColor: "#00a36c", marginTop: 20 },
  main: { flex: 1 },
  content: { flex: 1, padding: 15, backgroundColor: "#d8ffd8" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  card: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#fff",
    padding: 15,
    margin: 5,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  formRow: { flexDirection: "row", marginBottom: 10 },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  inputSearch: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  rowText: { fontSize: 14 },
  rowBtns: { flexDirection: "row", justifyContent: "flex-end" },
  editBtn: { backgroundColor: "#007bff" },
  deleteBtn: { backgroundColor: "#e53935" },
});
