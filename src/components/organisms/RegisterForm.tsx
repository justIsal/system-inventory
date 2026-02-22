import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useRegister } from '@/hooks/useRegister';
import { Alert } from '@/components/molecules/Alert';
import { AlertCircle } from 'lucide-react';
import { getPublicWarehouses } from '@/services/api/warehouseService';
import type { WarehousePublicResponse } from '@/types/warehouse.types';

export const RegisterForm = () => {
    const { handleRegister, isLoading, error } = useRegister();
    const [warehouses, setWarehouses] = useState<WarehousePublicResponse[]>([]);
    const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const data = await getPublicWarehouses();
                setWarehouses(data);
            } catch (err) {
                console.error('Failed to load warehouses', err);
            } finally {
                setIsLoadingWarehouses(false);
            }
        };
        fetchWarehouses();
    }, []);

    const form = useForm({
        defaultValues: {
            username: '',
            password: '',
            warehouse_id: 0,
        },
        onSubmit: async ({ value }) => {
            await handleRegister(value.username, value.password, Number(value.warehouse_id));
        },
    });

    return (
        <form 
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="ml-2">{error}</p>
                </Alert>
            )}

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Username
                </label>
                <form.Field
                    name="username"
                    validators={{
                        onChange: ({ value }) => value.length < 3 ? 'Username must be at least 3 characters' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                            placeholder="Create a new username"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                </label>
                <form.Field
                    name="password"
                    validators={{
                        onChange: ({ value }) => value.length < 6 ? 'Password must be at least 6 characters' : undefined,
                    }}
                    children={(field) => (
                        <Input
                            type="password"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.errors?.length ? field.state.meta.errors.join(', ') : undefined}
                            placeholder="Create a password (min 6 chars)"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Assign to Warehouse
                </label>
                <form.Field
                    name="warehouse_id"
                    validators={{
                        onChange: ({ value }) => value === 0 ? 'Please select a warehouse' : undefined,
                    }}
                    children={(field) => (
                        <div className="w-full">
                            <select
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors 
                                    ${field.state.meta.errors?.length ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} bg-white`}
                            >
                                <option value={0} disabled>
                                    {isLoadingWarehouses ? 'Loading warehouses...' : 'Select a Warehouse'}
                                </option>
                                {warehouses.map((w) => (
                                    <option key={w.warehouse_id} value={w.warehouse_id}>
                                        {w.name} {w.location ? `(${w.location})` : ''}
                                    </option>
                                ))}
                            </select>
                            {field.state.meta.errors?.length ? (
                                <p className="mt-1 text-xs text-red-500">{field.state.meta.errors.join(', ')}</p>
                            ) : null}
                        </div>
                    )}
                />
            </div>

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" isLoading={isSubmitting || isLoading} disabled={!canSubmit}>
                        Register Account
                    </Button>
                )}
            />
        </form>
    );
};
