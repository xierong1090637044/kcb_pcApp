export function getSize (size) {
  let result = size + 'b'
  if (size >= 1024 && size < 1024 * 1024) {
    if (size % 1024 === 0) {
      result = (size / 1024) + 'kb'
    } else {
      result = (size / 1024).toFixed(2) + 'kb'
    }
  }
  if (size >= 1024 * 1024 && size < 1024 * 1024 * 1024) {
    if (size % (1024 * 1024) === 0) {
      result = (size / (1024 * 1024)) + 'M'
    } else {
      result = (size / (1024 * 1024)).toFixed(2) + 'M'
    }
  }
  if (size >= 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024) {
    if (size % (1024 * 1024 * 1024) === 0) {
      result = (size / (1024 * 1024 * 1024)) + 'G'
    } else {
      result = result = (size / (1024 * 1024 * 1024)).toFixed(2) + 'G'
    }
  }
  return result
}

export function filterData (_id, tableData) {
  for (var i = 0; i < tableData.length; i++) {
    if (tableData[i]._id === _id) {
      return i
    }
  }
}
