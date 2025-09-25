// ===== GOOGLE APPS SCRIPT V2 - HỖ TRỢ COMBO PRODUCTS =====
// Dành cho Google Sheet mới với đầy đủ columns A-I

// 🔧 THAY BẰNG TÊN SHEET THẬT CỦA BẠN (check tab dưới Google Sheet)
const SHEET_NAME = 'Sheet1';  // Hoặc 'Trang tính1' nếu tiếng Việt

function doPost(e) {
  try {
    console.log('POST request received');
    
    // Parse request data
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid JSON format'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = requestData.action;
    console.log('Action:', action);
    
    if (action === 'upsert') {
      return handleUpsert(requestData.products);
    } else if (action === 'delete') {
      return handleDelete(requestData.ids);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Unknown action: ' + action
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('doPost error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Server error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    console.log('GET request received');
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const data = sheet.getDataRange().getValues();
    console.log('Raw data rows:', data.length);
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert sheet data to objects (skip header row)
    const headers = data[0];
    const products = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row[0] && !row[1]) continue;
      
      const product = {
        id: row[0] || '',              // Column A
        name: row[1] || '',            // Column B
        price: row[2] || 0,            // Column C
        duration: row[3] || 1,         // Column D
        unit: row[4] || 'tháng',       // Column E
        note: row[5] || '',            // Column F
        updateAT: row[6] || '',        // Column G
        category: row[7] || 'AI Services',  // Column H - COMBO SUPPORT
        comboProducts: row[8] || ''    // Column I - COMBO PRODUCTS
      };
      
      products.push(product);
    }
    
    console.log('Processed products:', products.length);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: products
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('doGet error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleUpsert(products) {
  try {
    console.log('Handling upsert for', products.length, 'products');
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    // Clear existing data (keep headers)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 9).clearContent();
    }
    
    // Prepare data for batch insert
    const rowsToInsert = products.map(product => [
      product.id || '',                    // Column A: id
      product.name || '',                  // Column B: name
      product.price || 0,                  // Column C: price
      product.duration || 1,               // Column D: duration
      product.unit || 'tháng',             // Column E: unit
      product.note || '',                  // Column F: note
      product.updateAT || new Date().toISOString(), // Column G: updateAT
      product.H || product.category || 'AI Services', // Column H: category ✅
      product.I || product.comboProducts || ''         // Column I: comboProducts ✅
    ]);
    
    // Batch insert all rows
    if (rowsToInsert.length > 0) {
      sheet.getRange(2, 1, rowsToInsert.length, 9).setValues(rowsToInsert);
      console.log('Successfully inserted', rowsToInsert.length, 'rows');
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully',
      rowsAffected: rowsToInsert.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('handleUpsert error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Upsert failed: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleDelete(idsToDelete) {
  try {
    console.log('Handling delete for IDs:', idsToDelete);
    
    if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'No IDs provided for deletion'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Sheet not found: ' + SHEET_NAME);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'No data to delete',
        rowsAffected: 0
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find rows to delete (working backwards to avoid index shifting)
    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
      const rowId = data[i][0]; // Column A = ID
      if (idsToDelete.includes(rowId)) {
        rowsToDelete.push(i + 1); // Sheet rows are 1-indexed
      }
    }
    
    // Delete rows
    let deletedCount = 0;
    rowsToDelete.forEach(rowIndex => {
      sheet.deleteRow(rowIndex);
      deletedCount++;
    });
    
    console.log('Successfully deleted', deletedCount, 'rows');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Products deleted successfully',
      rowsAffected: deletedCount
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('handleDelete error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Delete failed: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== TEST FUNCTIONS =====
function testGet() {
  const result = doGet({});
  console.log('Test GET result:', result.getContent());
}

function testPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        action: 'upsert',
        products: [
          {
            id: 'test-001',
            name: 'Test Product',
            price: 100000,
            duration: 1,
            unit: 'tháng',
            note: 'Test note',
            updateAT: new Date().toISOString(),
            category: 'AI Services',
            comboProducts: ''
          },
          {
            id: 'test-combo-001',
            name: 'Test Combo',
            price: 300000,
            duration: 1,
            unit: 'tháng',
            note: 'Test combo',
            updateAT: new Date().toISOString(),
            category: 'Combo',
            comboProducts: 'test-001,test-002'
          }
        ]
      })
    }
  };
  
  const result = doPost(testData);
  console.log('Test POST result:', result.getContent());
}
