<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RiderRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name', 
        'full_name',
        'father_name',
        'cnic_number',
        'mobile_primary',
        'mobile_alternate',
        'email',
        'address',
        'city',
        'state',
        'country',
        'zipcode',
        'vehicle_type',
        'vehicle_brand',
        'vehicle_model',
        'vehicle_registration',
        'driving_license_number',
        'bank_name',
        'account_number',
        'account_title',
        'per_parcel_payout',
        'profile_picture',
        'vehicle_registration_book',
        'vehicle_image',
        'cnic_front_image',
        'cnic_back_image',
        'driving_license_image',
        'electricity_bill',
        'status',
        'rejection_reason',
        'approved_at',
        'approved_by',
        'is_active',
        'documents_verified',
        'rating',
        'total_deliveries'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'is_active' => 'boolean',
        'documents_verified' => 'boolean',
        'per_parcel_payout' => 'decimal:2',
        'rating' => 'decimal:2'
    ];

    // Accessors for document URLs
    public function getProfilePictureUrlAttribute()
    {
        return $this->profile_picture ? Storage::url($this->profile_picture) : null;
    }

    public function getVehicleRegistrationBookUrlAttribute()
    {
        return $this->vehicle_registration_book ? Storage::url($this->vehicle_registration_book) : null;
    }

    public function getVehicleImageUrlAttribute()
    {
        return $this->vehicle_image ? Storage::url($this->vehicle_image) : null;
    }

    public function getCnicFrontImageUrlAttribute()
    {
        return $this->cnic_front_image ? Storage::url($this->cnic_front_image) : null;
    }

    public function getCnicBackImageUrlAttribute()
    {
        return $this->cnic_back_image ? Storage::url($this->cnic_back_image) : null;
    }

    public function getDrivingLicenseImageUrlAttribute()
    {
        return $this->driving_license_image ? Storage::url($this->driving_license_image) : null;
    }

    public function getElectricityBillUrlAttribute()
    {
        return $this->electricity_bill ? Storage::url($this->electricity_bill) : null;
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    // Methods
    public function approve($approvedBy = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $approvedBy,
            'is_active' => true
        ]);
    }

    public function reject($reason = null)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'is_active' => false
        ]);
    }

    public function hasAllDocuments()
    {
        return $this->profile_picture && 
               $this->vehicle_registration_book && 
               $this->vehicle_image && 
               $this->cnic_front_image && 
               $this->cnic_back_image && 
               $this->driving_license_image && 
               $this->electricity_bill;
    }
}