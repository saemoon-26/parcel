<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rider_registrations', function (Blueprint $table) {
            $table->id();
            
            // Personal Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('full_name');
            $table->string('father_name');
            $table->string('cnic_number')->unique();
            $table->string('mobile_primary');
            $table->string('mobile_alternate')->nullable();
            $table->string('email')->unique();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('Pakistan');
            $table->string('zipcode')->default('00000');
            
            // Vehicle Information
            $table->string('vehicle_type'); // Bike, Car, Van
            $table->string('vehicle_brand');
            $table->string('vehicle_model');
            $table->string('vehicle_registration')->unique();
            
            // License Information
            $table->string('driving_license_number');
            
            // Bank Information (Optional)
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_title')->nullable();
            
            // Payout Information
            $table->decimal('per_parcel_payout', 8, 2)->nullable();
            
            // Document Paths (File Storage)
            $table->string('profile_picture')->nullable();
            $table->string('vehicle_registration_book')->nullable();
            $table->string('vehicle_image')->nullable();
            $table->string('cnic_front_image')->nullable();
            $table->string('cnic_back_image')->nullable();
            $table->string('driving_license_image')->nullable();
            $table->string('electricity_bill')->nullable();
            
            // Status and Approval
            $table->enum('status', ['pending', 'approved', 'rejected', 'under_review'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            
            // Additional Fields
            $table->boolean('is_active')->default(false);
            $table->boolean('documents_verified')->default(false);
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_deliveries')->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['city', 'status']);
            $table->index(['is_active', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('rider_registrations');
    }
};