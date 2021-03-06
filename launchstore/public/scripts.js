const Mask = {
    apply(input, mask) {
        if ( mask === 'apply')
            return new Error('apply isn\'t a valid mask!')

        setTimeout(() => input.value = Mask[mask](input.value), 1)
    },
    formatBRL(value) {
        value = value.replace(/\D/g, '')

        return Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100)
    },
    formatCpfCnpj(value) {
        value = value.replace(/\D/g, '')

        if(value.length > 14) value = value.slice(0, -1)

        if(value.length > 11) {
            value = value.replace(/(\d{2})(\d)/, '$1.$2')
            value = value.replace(/(\d{3})(\d)/, '$1.$2')
            value = value.replace(/(\d{3})(\d)/, '$1/$2')
            value = value.replace(/(\d{4})(\d)/, '$1-$2')
        } else {
            value = value.replace(/(\d{3})(\d)/, '$1.$2')
            value = value.replace(/(\d{3})(\d)/, '$1.$2')
            value = value.replace(/(\d{3})(\d)/, '$1-$2')
        }

        return value
    },
    formatCEP(value) {
        value = value.replace(/\D/g, '')

        if(value.length > 8) value = value.slice(0, -1)

        value = value.replace(/(\d{5})(\d)/, '$1-$2')

        return value
    }
}

const PhotosUpload = {
    input: null,
    preview: document.querySelector('#photos-preview'),
    uploadLimit: 6,
    files: [],
    handleFileInput(event) {
        const { files: filesList } = event.target
        PhotosUpload.input = event.target

        if (PhotosUpload.hasLimit(filesList)) {
            event.preventDefault()
            PhotosUpload.input.files = PhotosUpload.getAllFiles()
            return
        }

        Array.from(filesList).forEach(file => {
            
            PhotosUpload.files.push(file)
            
            const reader = new FileReader()

            reader.onload = () => {
                const image = PhotosUpload.getImage(reader.result)
                PhotosUpload.preview.appendChild(image)
            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },
    hasLimit(filesList) {
        if (filesList.length + PhotosUpload.files.length > PhotosUpload.uploadLimit) {
            alert(`Envie no máximo ${ PhotosUpload.uploadLimit } fotos!`)
            return true
        }

        return false
    },
    getAllFiles() {
        const dataTransfer = new ClipboardEvent('').clipboardData || new DataTransfer()

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

        return dataTransfer.files
    },
    getImage(src) {
        const image = new Image()

        image.src = String(src)

        const div = document.createElement('div')
        div.classList.add('photo')

        div.onclick = PhotosUpload.removePhoto

        div.appendChild(image)
        div.appendChild(PhotosUpload.getRemoveButton())

        return div
    },
    getRemoveButton() {
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = 'delete'
        return button
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode
        const photosArray = Array.from(PhotosUpload.preview.children)
        const index = photosArray.indexOf(photoDiv)

        PhotosUpload.files.splice(index, 1)
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

        photoDiv.remove()
    },
    removeOldPhoto(event) {
        const photoDiv = event.target.parentNode
        
        if (photoDiv.id) {
            const removedFile = document.createElement('input')
            removedFile.setAttribute('type', 'hidden')
            removedFile.setAttribute('name', 'removed_files[]')

            removedFile.value = photoDiv.id

            PhotosUpload.preview.appendChild(removedFile)
        }

        photoDiv.remove()
    }
}

const ImageGallery = {
    highlight: document.querySelector('.gallery .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(event) {
        const { target: preview } = event

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'))

        preview.classList.add('active')

        ImageGallery.highlight.src = preview.src
        ImageGallery.highlight.alt = preview.alt
    }
}

const Lightbox = {
    lightbox: document.querySelector('.gallery .highlight .lightbox'),
    open(event) {
        event.preventDefault()

        const img = Lightbox.lightbox.querySelector('img')

        img.src = event.target.src
        img.alt = event.target.alt

        Lightbox.lightbox.classList.add('active')
    },
    close(event) {
        event.preventDefault()
        Lightbox.lightbox.classList.remove('active')
    }
}

const Validate = {
    apply(input, validate) {
        Validate.clearErrors(input)

        if ( validate === 'apply')
            return new Error('apply isn\'t valid!')

        const results = Validate[validate](input.value)
        input.value = results.value

        if(results.error)
            Validate.displayError(input, results.error)
        
    },
    displayError(input, error, required = true) {
        const err = document.createElement('div')
        err.classList.add('error')
        err.innerHTML = error

        input.classList.add('error')
        input.parentNode.appendChild(err)

        if(required)
            input.focus()
    },
    clearErrors(input) {
        input.classList.remove('error')
        const error = input.parentNode.querySelector(':scope > .error')

        if(error)
            error.remove()
    },
    isEmail(value) {
        let error = null
        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        
        if(!value.match(mailFormat))
            error = 'Email inválido!'

        return {
            error,
            value
        }
    },
    isCpfCnpj(value) {
        let error = null
        const cleanValues = value.replace(/\D/g, '')
        
        if(cleanValues.length > 11 && cleanValues.length !== 14)
            error = 'CNPJ inválido!'
        else if (cleanValues.length < 11)
            error = 'CPF inválido!'

        return {
            error,
            value
        }
    },
    isCEP(value) {
        let error = null
        const cleanValues = value.replace(/\D/g, '')
        
        if (cleanValues.length < 8)
            error = 'CEP inválido!'

        return {
            error,
            value
        }
    },
    confirmPassword(input, nameField) {
        Validate.clearErrors(input)

        if(input.value === '') {
            Validate.displayError(input, 'Senha não pode ser vazia!')
            return
        }
        
        const password = document.querySelector(`input[name="${nameField}"]`)
        
        if(password) {
            Validate.clearErrors(password)
        
            if (input.value !== password.value) {
                input = nameField === 'confirmPassword' ? password : input
                Validate.displayError(input, 'Senhas não correspondem!', false)
            }
        }
    },
    hasErrors(event) {
        Validate.clearErrors(event.target)

        if(document.querySelector('.field .error')) {
            event.preventDefault()
            Validate.displayError(event.target, 'Existem erros no formulário!', false)
        }
    }
}