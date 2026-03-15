import { useState } from 'react'
import axios from 'axios'
import './RiderRegistration.css'

const RiderRegistration = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    email: '',
    password: '',
    mobile_primary: '',
    mobile_alternate: '',
    cnic_number: '',
    driving_license_number: '',
    vehicle_type: 'Bike',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_registration: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    bank_name: '',
    account_number: '',
    account_title: ''
  })

  const [files, setFiles] = useState({
    profile_picture: null,
    cnic_front_image: null,
    cnic_back_image: null,
    driving_license_image: null,
    vehicle_registration_book: null,
    vehicle_image: null,
    electricity_bill: null
  })

  const [previews, setPreviews] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Auto-format CNIC
    if (name === 'cnic_number') {
      formattedValue = value.replace(/\D/g, '').slice(0, 13)
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5) + '-' + formattedValue.slice(5)
      if (formattedValue.length > 13) formattedValue = formattedValue.slice(0, 13) + '-' + formattedValue.slice(13)
    }

    // Auto-format mobile
    if (name === 'mobile_primary' || name === 'mobile_alternate') {
      formattedValue = value.replace(/\D/g, '').slice(0, 11)
    }

    setFormData({ ...formData, [name]: formattedValue })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    const name = e.target.name
    
    if (file) {
      setFiles({ ...files, [name]: file })
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) })
    }
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.father_name || !formData.email || !formData.password || !formData.mobile_primary) {
        setError('Please fill all required fields')
        return false
      }
      if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
        setError('Full name should contain only letters')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (!/^03\d{9}$/.test(formData.mobile_primary)) {
        setError('Mobile number must be 11 digits starting with 03')
        return false
      }
      if (formData.mobile_alternate && !/^03\d{9}$/.test(formData.mobile_alternate)) {
        setError('Alternate mobile must be 11 digits starting with 03')
        return false
      }
    }
    if (step === 2) {
      if (!formData.cnic_number || !formData.driving_license_number) {
        setError('Please fill all required fields')
        return false
      }
      if (!/^\d{5}-\d{7}-\d$/.test(formData.cnic_number)) {
        setError('CNIC must be in format: 12345-1234567-1')
        return false
      }
      if (formData.driving_license_number.length < 5) {
        setError('Please enter a valid driving license number')
        return false
      }
    }
    if (step === 3) {
      if (!formData.vehicle_type || !formData.address || !formData.city || !formData.state) {
        setError('Please fill all required fields')
        return false
      }
      if (formData.address.length < 10) {
        setError('Please enter a complete address')
        return false
      }
    }
    if (step === 4) {
      if (!files.profile_picture || !files.cnic_front_image || !files.cnic_back_image || !files.driving_license_image) {
        setError('Please upload all required documents')
        return false
      }
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    setError('')

    const submitData = new FormData()
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) submitData.append(key, formData[key])
    })
    
    Object.keys(files).forEach(key => {
      if (files[key]) submitData.append(key, files[key])
    })

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/rider-registrations', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.status) {
        setSuccess(true)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed'
      setError(`Registration failed: ${errorMsg}`)
      console.error('Registration error:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="registration-success">
        <div className="success-icon">✅</div>
        <h2>Registration Submitted Successfully!</h2>
        <p>Your application is under review. Admin will contact you soon.</p>
        <button onClick={() => window.location.href = '/login'}>Go to Login</button>
      </div>
    )
  }

  return (
    <div className="rider-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h1>Rider Registration</h1>
          <div className="progress-bar">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
            <div className={`progress-line ${step >= 4 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4</div>
            <div className={`progress-line ${step >= 5 ? 'active' : ''}`}></div>
            <div className={`progress-step ${step >= 5 ? 'active' : ''}`}>5</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Muhammad Ali" required />
                </div>
                <div className="form-group">
                  <label>Father Name *</label>
                  <input type="text" name="father_name" value={formData.father_name} onChange={handleInputChange} placeholder="Muhammad Hassan" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="ali@example.com" required />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                </div>
                <div className="form-group">
                  <label>Primary Mobile *</label>
                  <input type="tel" name="mobile_primary" value={formData.mobile_primary} onChange={handleInputChange} placeholder="03001234567" required />
                </div>
                <div className="form-group">
                  <label>Alternate Mobile</label>
                  <input type="tel" name="mobile_alternate" value={formData.mobile_alternate} onChange={handleInputChange} placeholder="03211234567" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>CNIC & License</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>CNIC Number *</label>
                  <input type="text" name="cnic_number" value={formData.cnic_number} onChange={handleInputChange} placeholder="12345-1234567-1" required />
                </div>
                <div className="form-group">
                  <label>Driving License Number *</label>
                  <input type="text" name="driving_license_number" value={formData.driving_license_number} onChange={handleInputChange} placeholder="DL123456" required />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Vehicle & Address</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} required>
                    <option value="">Select Vehicle Type</option>
                    <option value="Bike">Bike</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehicle Brand</label>
                  <select name="vehicle_brand" value={formData.vehicle_brand} onChange={handleInputChange}>
                    <option value="">Select Brand</option>
                    <option value="Honda">Honda</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="KTM">KTM</option>
                    <option value="United">United</option>
                    <option value="Changan">Changan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Daihatsu">Daihatsu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <input type="text" name="vehicle_model" value={formData.vehicle_model} onChange={handleInputChange} placeholder="CD 70" />
                </div>
                <div className="form-group">
                  <label>Vehicle Registration</label>
                  <input type="text" name="vehicle_registration" value={formData.vehicle_registration} onChange={handleInputChange} placeholder="ABC-123" />
                </div>
                <div className="form-group full-width">
                  <label>Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House 123, Street 5" required />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <select name="city" value={formData.city} onChange={handleInputChange} required>
                    <option value="">Select City</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Sialkot">Sialkot</option>
                    <option value="Gujranwala">Gujranwala</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <select name="state" value={formData.state} onChange={handleInputChange} required>
                    <option value="">Select State</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Zipcode</label>
                  <input type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} placeholder="38000" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h2>Upload Documents</h2>
              <div className="documents-grid">
                {[
                  { name: 'profile_picture', label: 'Profile Picture *', required: true },
                  { name: 'cnic_front_image', label: 'CNIC Front *', required: true },
                  { name: 'cnic_back_image', label: 'CNIC Back *', required: true },
                  { name: 'driving_license_image', label: 'Driving License *', required: true },
                  { name: 'vehicle_registration_book', label: 'Vehicle Registration Book', required: false },
                  { name: 'vehicle_image', label: 'Vehicle Image', required: false },
                  { name: 'electricity_bill', label: 'Electricity Bill', required: false }
                ].map(doc => (
                  <div key={doc.name} className="document-upload">
                    <label>{doc.label}</label>
                    <input type="file" name={doc.name} onChange={handleFileChange} accept="image/*" required={doc.required} />
                    {previews[doc.name] && <img src={previews[doc.name]} alt="Preview" className="preview-image" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="form-step">
              <h2>Bank Information (Optional)</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name</label>
                  <select name="bank_name" value={formData.bank_name} onChange={handleInputChange}>
                    <option value="">Select Bank</option>
                    <option value="HBL">HBL</option>
                    <option value="UBL">UBL</option>
                    <option value="MCB">MCB</option>
                    <option value="Allied Bank">Allied Bank</option>
                    <option value="Bank Alfalah">Bank Alfalah</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                    <option value="Faysal Bank">Faysal Bank</option>
                    <option value="Askari Bank">Askari Bank</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="Bank Al Habib">Bank Al Habib</option>
                    <option value="Soneri Bank">Soneri Bank</option>
                    <option value="Silk Bank">Silk Bank</option>
                    <option value="JS Bank">JS Bank</option>
                    <option value="Dubai Islamic Bank">Dubai Islamic Bank</option>
                    <option value="Samba Bank">Samba Bank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input type="text" name="account_number" value={formData.account_number} onChange={handleInputChange} placeholder="1234567890" />
                </div>
                <div className="form-group full-width">
                  <label>Account Title</label>
                  <input type="text" name="account_title" value={formData.account_title} onChange={handleInputChange} placeholder="Muhammad Ali" />
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && <button type="button" onClick={prevStep} className="btn-secondary">Previous</button>}
            {step < 5 && <button type="button" onClick={nextStep} className="btn-primary">Next</button>}
            {step === 5 && <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Registration'}</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default RiderRegistration
