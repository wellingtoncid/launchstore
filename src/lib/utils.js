module.exports = {
    age(timestamp) {
        const today = new Date()
        const dob = new Date(timestamp)

        let age = today.getFullYear() - dob.getFullYear()
        const month = today.getMonth() - dob.getMonth()


        if (month < 0 ||
            month == 0 &&
            today.getDate() <= dob.getDate()) {
            age = age - 1
        }

        return age

    },
    education(degree) {
        switch (degree) {
            case ('Associate'): return 'Associate'
            case ('Graduate'): return 'Graduate'
            case ('Master'): return 'Master'
            case ('Doctorate'): return 'Doctorate'
        }
    },
    date(timestamp) {
        const date = new Date(timestamp)

        const year = date.getFullYear()
        const month = `0${date.getMonth() + 1}`.slice(-2)
        const day = `0${date.getDate()}`.slice(-2)
        const hour = date.getHours()
        const minutes = `0${date.getMinutes()}`.slice(-2)

        return {
            day,
            month,
            year,
            hour,
            minutes,
            iso: `${year}-${month}-${day}`,
            birthDay: `${day}/${month}`,
            format: `${day}/${month}/${year}`
        }
    },
    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price / 100)
    },
    formatCpfCnpj(value) {
        value = value.replace(/\D/g, "")

        if (value.length > 14)
            value = value.slice(0, -1)

        if (value.length > 11) {
            // 11.222333444455
            value = value.replace(/(\d{2})(\d)/, "$1.$2")

            // 11.222.333444455
            value = value.replace(/(\d{3})(\d)/, "$1.$2")

            // 11.222.333/444455
            value = value.replace(/(\d{3})(\d)/, "$1/$2")

            // 11.222.333/4444-55
            value = value.replace(/(\d{4})(\d)/, "$1-$2")

        } else {
            // cpf 111.222.333-44
            value = value.replace(/(\d{3})(\d)/, "$1.$2")

            value = value.replace(/(\d{3})(\d)/, "$1.$2")

            value = value.replace(/(\d{3})(\d)/, "$1-$2")

        }
        return value
    },
    formatCep(value) {
        value = value.replace(/\D/g, "")

        if (value.length > 8)
            value = value.slice(0, -1)

        value = value.replace(/(\d{5})(\d)/, "$1-$2")

        return value
    }
}