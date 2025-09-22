import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";

export default function App() {
  const [page, setPage] = useState("login");
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [report, setReport] = useState(null);

  const saveItem = () => {
    if (!name || !date || !price) return;

    if (editId) {
      setItems(
        items.map((item) =>
          item.id === editId ? { ...item, name, date, price } : item
        )
      );
      setEditId(null);
    } else {
      const newItem = {
        id: Date.now().toString(),
        name,
        date,
        price,
      };
      setItems([...items, newItem]);
    }

    setName("");
    setDate("");
    setPrice("");
    setReport(null);
  };

  const editItem = (item) => {
    setName(item.name);
    setDate(item.date);
    setPrice(item.price);
    setEditId(item.id);
  };

  const deleteItem = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setItems(items.filter((item) => item.id !== id)),
      },
    ]);
  };

  const deleteAll = () => {
    Alert.alert("Confirm Delete", "Delete ALL items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete All", style: "destructive", onPress: () => setItems([]) },
    ]);
  };

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

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.date.toLowerCase().includes(search.toLowerCase()) ||
      item.price.includes(search)
  );

  return (
    <View style={styles.container}>
      {/* LOGIN PAGE */}
      {page === "login" && (
        <View style={styles.page}>
          <Text style={styles.header}>
            Double JDG Inventory Management System
          </Text>
          <View style={styles.loginBox}>
            <TextInput placeholder="Username" style={styles.input} />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.btn, styles.loginBtn]}
              onPress={() => setPage("home")}
            >
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MAIN APP */}
      {page !== "login" && (
        <View style={styles.app}>
          {/* Sidebar (Menu Bar Centered) */}
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

          {/* Content */}
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

                {/* Inputs */}
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

                {/* Buttons */}
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.btn} onPress={saveItem}>
                    <Text style={styles.btnText}>
                      {editId ? "Update" : "Add"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={generateReport}>
                    <Text style={styles.btnText}>Generate</Text>
                  </TouchableOpacity>
                </View>

                {/* Search + Delete All */}
                <View style={styles.searchRow}>
                  <TextInput
                    placeholder="Search"
                    style={styles.inputSearch}
                    value={search}
                    onChangeText={setSearch}
                  />
                  <TouchableOpacity
                    style={[styles.btn, styles.deleteBtn]}
                    onPress={deleteAll}
                  >
                    <Text style={styles.btnText}>Delete All</Text>
                  </TouchableOpacity>
                </View>

                {/* Report Box */}
                {report && (
                  <View style={styles.reportBox}>
                    <Text style={styles.reportText}>
                      📊 Total Items: {report.totalItems}
                    </Text>
                    <Text style={styles.reportText}>
                      💰 Total Value: ₱{report.totalValue}
                    </Text>
                    <Text style={styles.reportText}>
                      🆕 Latest Item: {report.latestItem.name} (₱
                      {report.latestItem.price})
                    </Text>
                  </View>
                )}

                {/* Inventory Table */}
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
                {report ? (
                  <View style={styles.reportBox}>
                    <Text style={styles.reportText}>
                      📊 Total Items: {report.totalItems}
                    </Text>
                    <Text style={styles.reportText}>
                      💰 Total Value: ₱{report.totalValue}
                    </Text>
                    <Text style={styles.reportText}>
                      🆕 Latest Item: {report.latestItem.name} (₱
                      {report.latestItem.price})
                    </Text>
                  </View>
                ) : (
                  <Text>No report generated yet.</Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  inputSearch: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 5,
  },
  rowText: { fontSize: 14, fontWeight: "500" },
  rowBtns: { flexDirection: "row" },
  editBtn: { backgroundColor: "#007bff" },
  deleteBtn: { backgroundColor: "#e53935" },
  reportBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  reportText: { fontSize: 15, marginBottom: 5, fontWeight: "500" },
});
