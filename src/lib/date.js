
function age(timestamp) {
    const today = new Date()
    const dob = new Date(timestamp)
    
    let age = today.getFullYear() - dob.getFullYear()
    const month = today.getMonth() - dob.getMonth()
    

    if (month < 0 || month == 0 && today.getDate() < dob.getDate()) {
        age = age -1
    }

    return age

}

