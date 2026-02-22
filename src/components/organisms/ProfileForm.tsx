import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Alert } from '@/components/molecules/Alert';
import { Modal } from '@/components/molecules/Modal';
import { AlertCircle, User, Building2, ShieldCheck, KeyRound } from 'lucide-react';
import { getMe, updateMe } from '@/services/api/userService';
import type { UserProfileResponse } from '@/types/user.types';
import { toast } from 'sonner';

export const ProfileForm = () => {
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingPassword, setPendingPassword] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMe();
                setProfile(data);
            } catch (err: any) {
                setServerError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setIsLoadingInit(false);
            }
        };
        fetchProfile();
    }, []);

    const form = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        onSubmit: async ({ value }) => {
            if (value.password !== value.confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }
            setPendingPassword(value.password);
            setIsConfirmModalOpen(true);
        },
    });

    const executePasswordUpdate = async () => {
        setIsConfirmModalOpen(false);
        try {
            const msg = await updateMe(pendingPassword);
            toast.success(msg);
            form.reset();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPendingPassword('');
        }
    };

    if (isLoadingInit) {
        return <div className="p-8 text-center text-gray-500">Loading profile data...</div>;
    }

    if (serverError || !profile) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="ml-2">{serverError || 'Profile not found'}</p>
            </Alert>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Account Overview
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Username</p>
                        <p className="font-medium text-gray-900">{profile.username}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4" /> Role
                        </p>
                        <p className="font-medium text-gray-900 capitalize">
                            {profile.role.replace('_', ' ')}
                        </p>
                    </div>
                    {profile.warehouse && (
                        <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4" /> Assigned Warehouse
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-blue-900">{profile.warehouse.name}</span>
                                {profile.warehouse.location && (
                                    <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                                        {profile.warehouse.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                    <p className="text-sm text-gray-500 mt-1">Update your password to ensure account security.</p>
                </div>
                <div className="p-6">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="space-y-6 max-w-md"
                    >
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                New Password
                            </label>
                            <form.Field
                                name="password"
                                validators={{
                                    onChange: ({ value }) => 
                                        value && value.length < 6 ? 'Password must be at least 6 characters' : undefined,
                                }}
                                children={(field) => (
                                    <Input
                                        type="password"
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                                        placeholder="Enter new password"
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <form.Field
                                name="confirmPassword"
                                validators={{
                                    onChangeListenTo: ['password'],
                                    onChange: ({ value, fieldApi }) => {
                                        if (value !== fieldApi.form.getFieldValue('password')) {
                                            return 'Passwords do not match';
                                        }
                                        return undefined;
                                    },
                                }}
                                children={(field) => (
                                    <Input
                                        type="password"
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                                        placeholder="Confirm new password"
                                    />
                                )}
                            />
                        </div>

                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting, state.values.password] as const}
                            children={([canSubmit, isSubmitting, password]) => (
                                <Button 
                                    type="submit" 
                                    isLoading={isSubmitting}
                                    disabled={!canSubmit || !password}
                                >
                                    Update Password
                                </Button>
                            )}
                        />
                    </form>
                </div>
            </div>

            <Modal 
                isOpen={isConfirmModalOpen} 
                onClose={() => setIsConfirmModalOpen(false)}
                title="Update Password"
                description="Are you sure you want to change your account password?"
            >
                <div className="mt-4 flex flex-col items-center justify-center p-4">
                    <KeyRound className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        For security reasons, you will need to use your new password the next time you log in.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={executePasswordUpdate}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
                        >
                            {form.state.isSubmitting ? 'Updating...' : 'Yes, Change Password'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
